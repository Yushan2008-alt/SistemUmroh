'use client'

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { terbilang, formatRupiah } from '@/features/payments/utils/terbilang'

// A5 Landscape dimensions: 595.28 x 419.53 pt
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    paddingBottom: 12,
    marginBottom: 16,
  },
  travelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
  },
  travelTagline: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  travelAddress: {
    fontSize: 7.5,
    color: '#475569',
    marginTop: 2,
    maxWidth: 260,
  },
  receiptTitleContainer: {
    alignItems: 'flex-end',
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1,
  },
  receiptCode: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
    marginTop: 2,
  },
  receiptDate: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  body: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    width: 140,
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold',
  },
  colon: {
    width: 15,
    fontSize: 9,
    color: '#475569',
  },
  value: {
    flex: 1,
    fontSize: 9,
    color: '#0f172a',
  },
  terbilangBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  terbilangText: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#166534',
    lineHeight: 1.3,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    padding: 10,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 15,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065f46',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#059669',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
  },
  footerLeft: {
    width: 250,
  },
  noteTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 7,
    color: '#94a3b8',
    lineHeight: 1.2,
  },
  signatureBox: {
    alignItems: 'center',
    width: 140,
  },
  signatureCity: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    width: '100%',
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 1,
  },
})

export interface ReceiptData {
  receiptCode: string
  date: string
  pilgrimName: string
  packageName: string
  paymentType: string
  amount: number
  paymentMethod: string
  bankName?: string
  branchName: string
  cashierName: string
}

export function ReceiptDocument({ data }: { data: ReceiptData }) {
  const terbilangStr = terbilang(data.amount)

  return (
    <Document title={`Kwitansi-${data.receiptCode}`}>
      <Page size="A5" orientation="landscape" style={styles.page}>
        {/* Header Travel */}
        <View style={styles.header}>
          <View>
            <Text style={styles.travelName}>PT Al-Madinah Tour & Travel</Text>
            <Text style={styles.travelTagline}>Penyelenggara Perjalanan Ibadah Umroh & Haji Khusus</Text>
            <Text style={styles.travelAddress}>
              Jl. M.H. Thamrin No. 12, Jakarta Pusat | Telp: 021-3901234
            </Text>
          </View>
          <View style={styles.receiptTitleContainer}>
            <Text style={styles.receiptTitle}>KWITANSI PEMBAYARAN</Text>
            <Text style={styles.receiptCode}>{data.receiptCode}</Text>
            <Text style={styles.receiptDate}>{data.date}</Text>
          </View>
        </View>

        {/* Detail Pembayaran */}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.label}>Telah Diterima Dari</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>{data.pilgrimName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Uang Sejumlah</Text>
            <Text style={styles.colon}>:</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.terbilangBox}>
                <Text style={styles.terbilangText}># {terbilangStr} #</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Untuk Pembayaran</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>
              {data.paymentType} - {data.packageName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Metode Pembayaran</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>
              {data.paymentMethod.toUpperCase()} {data.bankName ? `(${data.bankName})` : ''}
            </Text>
          </View>

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>TOTAL DIBAYAR</Text>
            <Text style={styles.amountValue}>{formatRupiah(data.amount)}</Text>
          </View>
        </View>

        {/* Footer & Tanda Tangan */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.noteTitle}>CATATAN RESMI:</Text>
            <Text style={styles.noteText}>
              1. Kwitansi ini merupakan bukti pembayaran sah yang dikeluarkan oleh sistem travel.
            </Text>
            <Text style={styles.noteText}>
              2. Simpan tanda terima ini untuk verifikasi pelunasan dan serah terima perlengkapan.
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureCity}>{data.branchName}, {data.date}</Text>
            <Text style={styles.signatureName}>{data.cashierName}</Text>
            <Text style={styles.signatureRole}>Bagian Kasir / Keuangan</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
