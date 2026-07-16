import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FolkTale from '@/models/FolkTale';

const DEFAULT_FOLKTALES = [
  {
    id: 'timun_mas',
    title: 'Timun Mas',
    icon: '🥒',
    region: 'Jawa Tengah',
    coverColor: '#c8e6c9',
    accentColor: '#2e7d32',
    pages: [
      {
        text: 'Dahulu kala, ada seorang ibu tua yang kesepian. Ia memohon kepada raksasa hijau yang besar untuk diberi seorang anak. Raksasa itu memberinya sebuah biji mentimun ajaib yang berkilauan.',
        illustrationKey: 'timun_mas_1',
        bgColor: '#e8f5e9',
      },
      {
        text: 'Dari biji ajaib itu, tumbuhlah buah mentimun yang sangat besar! Di dalamnya terdapat bayi mungil nan cantik. Ibu menamainya Timun Mas. Ia tumbuh menjadi gadis yang baik hati dan pemberani.',
        illustrationKey: 'timun_mas_2',
        bgColor: '#f1f8e9',
      },
      {
        text: 'Suatu hari, raksasa datang untuk mengambil Timun Mas! "Serahkan anak itu padaku!" teriaknya. Ibu memberikan empat kantong ajaib kepada Timun Mas. "Larilah, anakku! Gunakan kantong ini!"',
        illustrationKey: 'timun_mas_3',
        bgColor: '#fff3e0',
      },
      {
        text: 'Timun Mas berlari sekencang angin! Ia melempar kantong pertama berisi biji mentimun — WUSSS! Tumbuh hutan lebat menghalangi raksasa! Ia lempar kantong kedua berisi jarum — CRASS! Muncul gunung bambu runcing!',
        illustrationKey: 'timun_mas_4',
        bgColor: '#e0f2f1',
      },
      {
        text: 'Kantong ketiga berisi garam — BYUURR! Muncul lautan luas yang sangat dalam! Raksasa tenggelam dan tidak bisa mengejar lagi. Timun Mas selamat dan kembali ke pelukan ibunya. Mereka hidup bahagia selamanya!',
        illustrationKey: 'timun_mas_5',
        bgColor: '#e3f2fd',
      },
    ],
  },
  {
    id: 'si_kancil',
    title: 'Si Kancil dan Buaya',
    icon: '🦌',
    region: 'Melayu',
    coverColor: '#fff9c4',
    accentColor: '#f57f17',
    pages: [
      {
        text: 'Di tepi hutan yang rindang, hiduplah Si Kancil yang sangat cerdik. Suatu hari, ia ingin menyeberangi sungai yang lebar. Tapi sungai itu penuh dengan buaya-buaya ganas yang lapar!',
        illustrationKey: 'si_kancil_1',
        bgColor: '#fff8e1',
      },
      {
        text: 'Si Kancil berpikir keras. Lalu ia punya ide cemerlang! "Hei Buaya-Buaya! Aku punya perintah dari Raja Hutan! Ia ingin aku menghitung jumlah kalian semua!" teriak Si Kancil dengan suara lantang.',
        illustrationKey: 'si_kancil_2',
        bgColor: '#f9fbe7',
      },
      {
        text: 'Buaya-buaya itu merasa bangga karena diperhatikan oleh Raja. Mereka berbaris rapi membentuk jembatan panjang dari tepi sungai yang satu ke tepi yang lain. "Ayo hitung kami!" kata si buaya besar.',
        illustrationKey: 'si_kancil_3',
        bgColor: '#e0f7fa',
      },
      {
        text: 'Si Kancil melompat dari punggung buaya satu ke buaya lainnya sambil menghitung dengan riang! "Satu! Dua! Tiga! Empat! Lima!" Lompat, lompat, lompat! Ia terus melompat sampai ke seberang!',
        illustrationKey: 'si_kancil_4',
        bgColor: '#e8f5e9',
      },
      {
        text: 'Begitu sampai di seberang, Si Kancil tertawa gembira! "Hahaha! Terima kasih buaya-buaya! Aku sudah berhasil menyeberang!" Buaya-buaya sangat kesal karena tertipu! Si Kancil pun berlari masuk ke hutan.',
        illustrationKey: 'si_kancil_5',
        bgColor: '#fff3e0',
      },
    ],
  },
  {
    id: 'malin_kundang',
    title: 'Malin Kundang',
    icon: '🚢',
    region: 'Sumatera Barat',
    coverColor: '#bbdefb',
    accentColor: '#1565c0',
    pages: [
      {
        text: 'Di sebuah desa di tepi pantai Sumatera, hiduplah Malin Kundang bersama ibunya yang miskin. Mereka hidup sederhana. Ibunya sangat menyayangi Malin dan selalu bekerja keras untuknya.',
        illustrationKey: 'malin_kundang_1',
        bgColor: '#e3f2fd',
      },
      {
        text: 'Ketika remaja, Malin berlayar dengan kapal dagang untuk mencari kehidupan yang lebih baik. "Ibu, aku akan kembali membawa kebahagiaan!" janjinya. Ibunya menunggu di pantai dengan penuh harap.',
        illustrationKey: 'malin_kundang_2',
        bgColor: '#e1f5fe',
      },
      {
        text: 'Bertahun-tahun berlalu. Malin menjadi saudagar yang sangat kaya! Ia memiliki kapal besar yang megah dan istri yang cantik jelita. Ia hidup mewah di negeri seberang.',
        illustrationKey: 'malin_kundang_3',
        bgColor: '#fff8e1',
      },
      {
        text: 'Suatu hari, kapal Malin berlabuh di kampung halamannya. Ibunya yang sudah tua berlari ke pantai. "Malin! Anakku!" Tapi Malin malu. "Aku tidak kenal perempuan tua miskin itu!" katanya.',
        illustrationKey: 'malin_kundang_4',
        bgColor: '#fce4ec',
      },
      {
        text: 'Hati ibunya sangat hancur dan sedih. Dengan air mata, ia berdoa. Tiba-tiba langit menjadi gelap dan petir menyambar! Malin dan kapalnya berubah menjadi batu. Pesan cerita ini: Sayangilah selalu ibu dan ayahmu!',
        illustrationKey: 'malin_kundang_5',
        bgColor: '#eceff1',
      },
    ],
  },
  {
    id: 'lutung_kasarung',
    title: 'Lutung Kasarung',
    icon: '🐒',
    region: 'Jawa Barat',
    coverColor: '#d1c4e9',
    accentColor: '#6a1b9a',
    pages: [
      {
        text: 'Di Kerajaan Pasir Batang, ada dua putri. Purbararang si kakak yang sombong, dan Purbasari si adik yang baik hati. Purbararang iri dengan kecantikan adiknya dan mengusirnya ke hutan.',
        illustrationKey: 'lutung_kasarung_1',
        bgColor: '#f3e5f5',
      },
      {
        text: 'Di dalam hutan yang lebat, Purbasari bertemu seekor lutung hitam yang lucu. Lutung itu sangat baik hati! Ia selalu menemani dan melindungi Purbasari dari bahaya.',
        illustrationKey: 'lutung_kasarung_2',
        bgColor: '#e8f5e9',
      },
      {
        text: 'Ternyata, lutung itu adalah Pangeran Guru Minda yang tampan! Ia dikutuk oleh penyihir jahat menjadi seekor monyet. Hanya kebaikan sejati yang bisa melepaskan kutukannya.',
        illustrationKey: 'lutung_kasarung_3',
        bgColor: '#e8eaf6',
      },
      {
        text: 'Purbararang menantang Purbasari dalam sayembara kecantikan dan memasak. Dengan bantuan lutung yang ajaib, Purbasari memenangkan semua tantangan! Rakyat bersorak gembira!',
        illustrationKey: 'lutung_kasarung_4',
        bgColor: '#fff3e0',
      },
      {
        text: 'Karena kebaikan hati Purbasari, kutukan terlepas! Lutung berubah menjadi Pangeran Guru Minda yang tampan! Purbasari menjadi ratu yang adil dan bijaksana. Semua rakyat hidup bahagia!',
        illustrationKey: 'lutung_kasarung_5',
        bgColor: '#fce4ec',
      },
    ],
  },
  {
    id: 'jaka_tarub',
    title: 'Jaka Tarub',
    icon: '🦢',
    region: 'Jawa Tengah',
    coverColor: '#b3e5fc',
    accentColor: '#0277bd',
    pages: [
      {
        text: 'Di sebuah desa yang damai, hiduplah seorang pemuda baik bernama Jaka Tarub. Ia tinggal di rumah kecil dekat hutan yang indah, dikelilingi pohon-pohon besar dan bunga-bunga cantik.',
        illustrationKey: 'jaka_tarub_1',
        bgColor: '#e8f5e9',
      },
      {
        text: 'Suatu malam yang terang bulan, Jaka Tarub mendengar suara indah dari dalam hutan. Ia mengikuti suara itu dan menemukan telaga yang berkilauan. Tujuh bidadari cantik turun dari langit dan mandi di telaga!',
        illustrationKey: 'jaka_tarub_2',
        bgColor: '#e8eaf6',
      },
      {
        text: 'Jaka Tarub terpesona dengan bidadari paling cantik bernama Nawang Wulan. Diam-diam ia menyembunyikan selendang ajaib milik Nawang Wulan di bawah tumpukan padi.',
        illustrationKey: 'jaka_tarub_3',
        bgColor: '#fce4ec',
      },
      {
        text: 'Tanpa selendang ajaibnya, Nawang Wulan tidak bisa terbang kembali ke langit. Ia tinggal di bumi dan menikah dengan Jaka Tarub. Mereka dikaruniai seorang putri cantik dan hidup bahagia.',
        illustrationKey: 'jaka_tarub_4',
        bgColor: '#fff3e0',
      },
      {
        text: 'Namun suatu hari, Nawang Wulan menemukan selendangnya yang tersembunyi. Dengan hati yang sedih, ia memakai selendang itu dan terbang kembali ke langit. "Jaga putri kita baik-baik, ya!" pesannya kepada Jaka Tarub.',
        illustrationKey: 'jaka_tarub_5',
        bgColor: '#e3f2fd',
      },
    ],
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing
    await FolkTale.deleteMany({});

    const seeded = await FolkTale.insertMany(DEFAULT_FOLKTALES);

    return NextResponse.json({
      success: true,
      message: 'Cerita Rakyat seeded successfully!',
      count: seeded.length,
    });
  } catch (error: any) {
    console.error('Error seeding folktales:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
