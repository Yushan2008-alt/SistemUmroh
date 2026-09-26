-- ==============================================================================
-- 03_rpc_functions.sql
-- Sistem Manajemen Travel Umroh & Haji
-- High-Performance Database Functions & Concurrency-Protected RPCs
-- ==============================================================================

-- 1. RPC: book_registration
-- Concurrency protected with 'FOR UPDATE' row lock on packages
CREATE OR REPLACE FUNCTION public.book_registration(
    p_pilgrim_id BIGINT,
    p_package_id BIGINT,
    p_agent_id BIGINT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pkg RECORD;
    v_pilgrim RECORD;
    v_booked_count INT;
    v_reg_id BIGINT;
    v_reg_code VARCHAR(50);
    v_branch_id BIGINT;
    v_agent_rate NUMERIC(5, 2);
    v_comm_amount NUMERIC(15, 2);
BEGIN
    -- 1. Row-lock package record to prevent race conditions & overbooking
    SELECT * INTO v_pkg FROM public.packages WHERE id = p_package_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paket perjalanan ID % tidak ditemukan.', p_package_id;
    END IF;

    -- 2. Validate quota availability
    SELECT COUNT(*) INTO v_booked_count 
    FROM public.registrations 
    WHERE package_id = p_package_id AND status != 'cancelled';

    IF v_booked_count >= v_pkg.quota THEN
        RAISE EXCEPTION 'KUOTA_PENUH: Kuota paket (%) telah terisi penuh (%/% kursi).', 
            v_pkg.name, v_booked_count, v_pkg.quota;
    END IF;

    -- 3. Get pilgrim branch
    SELECT * INTO v_pilgrim FROM public.pilgrims WHERE id = p_pilgrim_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data jamaah ID % tidak ditemukan.', p_pilgrim_id;
    END IF;
    v_branch_id := v_pilgrim.branch_id;

    -- 4. Generate unique registration code: REG-XXXXXX
    v_reg_code := 'REG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));

    -- 5. Insert registration
    INSERT INTO public.registrations (
        branch_id,
        pilgrim_id,
        package_id,
        agent_id,
        code,
        status,
        total_price,
        registered_at,
        notes
    ) VALUES (
        v_branch_id,
        p_pilgrim_id,
        p_package_id,
        p_agent_id,
        v_reg_code,
        'pending',
        v_pkg.price,
        CURRENT_DATE,
        p_notes
    ) RETURNING id INTO v_reg_id;

    -- 6. Calculate & insert agent commission if referral exists
    IF p_agent_id IS NOT NULL THEN
        SELECT commission_rate INTO v_agent_rate FROM public.agents WHERE id = p_agent_id;
        IF FOUND AND v_agent_rate > 0 THEN
            v_comm_amount := (v_pkg.price * v_agent_rate) / 100.0;
            INSERT INTO public.commissions (
                branch_id,
                agent_id,
                registration_id,
                base_amount,
                rate,
                amount,
                status
            ) VALUES (
                v_branch_id,
                p_agent_id,
                v_reg_id,
                v_pkg.price,
                v_agent_rate,
                v_comm_amount,
                'pending'
            );
        END IF;
    END IF;

    -- 7. Auto-generate standard document checklist
    INSERT INTO public.documents (pilgrim_id, type, label, status)
    VALUES 
        (p_pilgrim_id, 'ktp', 'KTP Asli / e-KTP', 'pending'),
        (p_pilgrim_id, 'kk', 'Kartu Keluarga (KK)', 'pending'),
        (p_pilgrim_id, 'paspor', 'Paspor Asli (Masa Berlaku Min. 7 Bulan)', 'pending'),
        (p_pilgrim_id, 'foto', 'Pas Foto 4x6 Latar Putih (Wajah 80%)', 'pending'),
        (p_pilgrim_id, 'buku_nikah', 'Buku Nikah / Akta Kelahiran', 'pending'),
        (p_pilgrim_id, 'vaksin', 'Sertifikat Vaksin Meningitis', 'pending')
    ON CONFLICT DO NOTHING;

    -- 8. Auto-generate standard equipment checklist
    INSERT INTO public.equipment_distributions (registration_id, item, quantity, status)
    VALUES
        (v_reg_id, 'Koper Bagasi 24 Inch', 1, 'pending'),
        (v_reg_id, 'Koper Kabin 20 Inch', 1, 'pending'),
        (v_reg_id, 'Tas Paspor & Dokumen', 1, 'pending'),
        (v_reg_id, 'Seragam Batik Travel', 1, 'pending'),
        (v_reg_id, 'Kain Ihram (Pria) / Mukena (Wanita)', 1, 'pending'),
        (v_reg_id, 'Buku Doa & Panduan Manasik', 1, 'pending'),
        (v_reg_id, 'Tali ID Card Jamaah', 1, 'pending');

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_reg_id,
        'code', v_reg_code,
        'message', 'Pendaftaran berhasil dibuat dan kuota terproteksi.'
    );
END;
$$;

-- 2. RPC: record_payment
-- Atomic cashier payment update with auto status recalculation
CREATE OR REPLACE FUNCTION public.record_payment(
    p_payment_id BIGINT,
    p_amount NUMERIC(15, 2),
    p_method payment_method_enum,
    p_bank_account_id BIGINT DEFAULT NULL,
    p_proof_path TEXT DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pay RECORD;
    v_new_paid NUMERIC(15, 2);
    v_new_status payment_status_enum;
BEGIN
    -- 1. Row-lock payment record
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tagihan pembayaran ID % tidak ditemukan.', p_payment_id;
    END IF;

    IF v_pay.status = 'paid' THEN
        RAISE EXCEPTION 'Tagihan pembayaran ini sudah berstatus LUNAS.';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Nominal pembayaran harus lebih besar dari 0.';
    END IF;

    v_new_paid := v_pay.paid_amount + p_amount;
    
    -- Prevent silent overpayment
    IF v_new_paid > v_pay.amount THEN
        RAISE EXCEPTION 'Nominal pembayaran melebihi sisa tagihan. Maksimal pembayaran: %', (v_pay.amount - v_pay.paid_amount);
    END IF;

    -- 2. Calculate status
    IF v_new_paid >= v_pay.amount THEN
        v_new_status := 'paid';
    ELSE
        v_new_status := 'partial';
    END IF;

    -- 3. Update payment
    UPDATE public.payments SET
        paid_amount = v_new_paid,
        status = v_new_status,
        paid_at = NOW(),
        method = p_method,
        bank_account_id = p_bank_account_id,
        recorded_by = auth.uid(),
        proof_path = COALESCE(p_proof_path, proof_path),
        note = COALESCE(p_note, note),
        updated_at = NOW()
    WHERE id = p_payment_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', p_payment_id,
        'paid_amount', v_new_paid,
        'status', v_new_status,
        'message', 'Pembayaran kasir berhasil dicatat.'
    );
END;
$$;

-- 3. RPC: generate_bill_schedule
-- Generates down payment and installment invoices with rounding remainder absorption
CREATE OR REPLACE FUNCTION public.generate_bill_schedule(
    p_registration_id BIGINT,
    p_down_payment NUMERIC(15, 2),
    p_installments_count INT,
    p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reg RECORD;
    v_remaining NUMERIC(15, 2);
    v_monthly_base NUMERIC(15, 2);
    v_remainder NUMERIC(15, 2);
    v_current_amount NUMERIC(15, 2);
    v_due_date DATE;
    v_code VARCHAR(50);
    v_count INT := 0;
    i INT;
BEGIN
    SELECT * INTO v_reg FROM public.registrations WHERE id = p_registration_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registrasi ID % tidak ditemukan.', p_registration_id;
    END IF;

    -- 1. Insert Down Payment (DP) if applicable
    IF p_down_payment > 0 THEN
        v_code := 'INV-DP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        INSERT INTO public.payments (
            branch_id,
            registration_id,
            code,
            type,
            amount,
            paid_amount,
            status,
            due_date
        ) VALUES (
            v_reg.branch_id,
            p_registration_id,
            v_code,
            'down_payment',
            p_down_payment,
            0.00,
            'unpaid',
            CURRENT_DATE + INTERVAL '7 days'
        );
        v_count := v_count + 1;
    END IF;

    -- 2. Calculate Installments
    v_remaining := v_reg.total_price - p_down_payment;
    IF v_remaining > 0 AND p_installments_count > 0 THEN
        v_monthly_base := FLOOR(v_remaining / p_installments_count);
        v_remainder := v_remaining - (v_monthly_base * p_installments_count);

        FOR i IN 1..p_installments_count LOOP
            -- Absorb rounding remainder on last installment
            IF i = p_installments_count THEN
                v_current_amount := v_monthly_base + v_remainder;
            ELSE
                v_current_amount := v_monthly_base;
            END IF;

            v_due_date := p_start_date + ((i - 1) * INTERVAL '1 month');
            v_code := 'INV-CICIL-' || i || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

            INSERT INTO public.payments (
                branch_id,
                registration_id,
                code,
                type,
                amount,
                paid_amount,
                status,
                due_date
            ) VALUES (
                v_reg.branch_id,
                p_registration_id,
                v_code,
                'installment',
                v_current_amount,
                0.00,
                'unpaid',
                v_due_date
            );
            v_count := v_count + 1;
        END LOOP;
    ELSIF v_remaining > 0 AND p_installments_count = 0 AND p_down_payment = 0 THEN
        -- Full single payment
        v_code := 'INV-FULL-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        INSERT INTO public.payments (
            branch_id,
            registration_id,
            code,
            type,
            amount,
            paid_amount,
            status,
            due_date
        ) VALUES (
            v_reg.branch_id,
            p_registration_id,
            v_code,
            'full_payment',
            v_reg.total_price,
            0.00,
            'unpaid',
            CURRENT_DATE + INTERVAL '14 days'
        );
        v_count := v_count + 1;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'bills_generated', v_count,
        'message', format('%s tagihan pembayaran berhasil di-generate.', v_count)
    );
END;
$$;

-- 4. RPC: get_dashboard_summary
-- Aggregated statistical metrics for super admin / branch admin dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_branch_id BIGINT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_pilgrims BIGINT;
    v_active_registrations BIGINT;
    v_revenue_collected NUMERIC(15, 2);
    v_outstanding_bills NUMERIC(15, 2);
    v_payment_status_breakdown JSONB;
BEGIN
    -- Total Pilgrims
    SELECT COUNT(*) INTO v_total_pilgrims
    FROM public.pilgrims
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND is_active = TRUE;

    -- Active Registrations
    SELECT COUNT(*) INTO v_active_registrations
    FROM public.registrations
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND status IN ('pending', 'confirmed');

    -- Total Revenue Collected
    SELECT COALESCE(SUM(paid_amount), 0) INTO v_revenue_collected
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id);

    -- Total Outstanding Bills
    SELECT COALESCE(SUM(amount - paid_amount), 0) INTO v_outstanding_bills
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND status != 'paid';

    -- Payment status counts
    SELECT jsonb_build_object(
        'paid', COUNT(*) FILTER (WHERE status = 'paid'),
        'partial', COUNT(*) FILTER (WHERE status = 'partial'),
        'unpaid', COUNT(*) FILTER (WHERE status = 'unpaid')
    ) INTO v_payment_status_breakdown
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id);

    RETURN jsonb_build_object(
        'total_pilgrims', v_total_pilgrims,
        'active_registrations', v_active_registrations,
        'revenue_collected', v_revenue_collected,
        'outstanding_bills', v_outstanding_bills,
        'payment_status_breakdown', v_payment_status_breakdown
    );
END;
$$;
