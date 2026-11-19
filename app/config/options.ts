import type { Option } from '~/types'

function list(values: string[]): Option[] {
  return values.map((value) => ({ label: value, value }))
}

export const auctions = list(['Copart', 'IAAI', 'Manheim'])

export const auctionTypes: Option[] = [
  { label: 'Canlı hərrac', value: 'live' },
  { label: 'Vaxtlı hərrac (Timed)', value: 'timed' },
  { label: 'İndi al (Buy Now)', value: 'buyNow' },
]

export const saleStatuses: Option[] = [
  { label: 'Minimum təklif əsasında', value: 'minBid' },
  { label: 'Şərtsiz satış', value: 'pure' },
  { label: 'Satıcı təsdiqi ilə', value: 'approval' },
]

export const documents = list(['Standart sənəd', 'Qeyri-standart sənəd', 'Məlumat yoxdur'])

export const fuels = list(['Benzin', 'Dizel', 'Hibrid', 'Elektrik'])

export const transmissions = list(['Avtomat', 'Mexaniki', 'Variator', 'Robot'])

export const drives = list(['Ön', 'Arxa', 'Tam'])

export const odometerTypes = list(['Dəqiq', 'Dəqiq deyil'])

export const conditions = list(['İşləyir və sürülür', 'Mühərrik işə düşür', 'Məlum deyil'])

export const countries: Option[] = [
  { label: 'Azərbaycan', value: 'aze' },
  { label: 'Gürcüstan', value: 'geo' },
]

export const partTypes: Option[] = [
  { label: 'Mühərrik', value: 'engine' },
  { label: 'Kuzov hissələri', value: 'body' },
  { label: 'Optika', value: 'lights' },
  { label: 'Asma', value: 'suspension' },
  { label: 'Əyləc sistemi', value: 'brakes' },
  { label: 'Elektrik', value: 'electric' },
  { label: 'Salon', value: 'interior' },
  { label: 'Təkər və disk', value: 'wheels' },
]

export const partConditions = list(['Yeni', 'İşlənmiş', 'Bərpa edilmiş'])

export const requestStatuses: Option[] = [
  { label: 'Yeni', value: 'new' },
  { label: 'İcrada', value: 'in_progress' },
  { label: 'Tamamlandı', value: 'done' },
  { label: 'Ləğv edildi', value: 'cancelled' },
]
