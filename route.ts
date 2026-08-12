import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Sesi pengguna tidak valid.' }, { status: 400 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabaseAdmin
      .from('user_generator_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .gte('generated_at', twentyFourHoursAgo);

    if (countError) {
      return NextResponse.json({ error: 'Gagal memverifikasi limit keamanan.' }, { status: 500 });
    }

    if (count && count >= 1) {
      return NextResponse.json({ 
        error: 'Batas harian tercapai! Akses generator Anda terkunci. Silakan kembali lagi besok.' 
      }, { status: 429 });
    }

    const IS_ZNN_MAINTENANCE = true; 
    let resultAccount = null;

    if (IS_ZNN_MAINTENANCE) {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      resultAccount = {
        email: "alight-shared-prem99@znn-gateway.net",
        password: "ZnnPremiumSecretXYZ",
        expired_at: "Aktif (Akun Pool Sharing)",
        note: "Mode cadangan aktif karena server x-znn utama sedang maintenance."
      };
    } else {
      try {
        const targetUrl = `https://api.znn.my.id/downloader/alightmotion?apikey=${process.env.ZNN_API_KEY}`;
        const znnRes = await fetch(targetUrl, { method: 'GET', cache: 'no-store' });
        if (!znnRes.ok) throw new Error('API Pihak ketiga bermasalah');
        const znnData = await znnRes.json();
        if (!znnData || !znnData.result) throw new Error('Struktur data kosong');
        resultAccount = {
          email: znnData.result.email,
          password: znnData.result.password,
          expired_at: znnData.result.expired || "Premium",
          note: "Data live berhasil diambil dari infrastruktur x-znn."
        };
      } catch (err) {
        resultAccount = {
          email: "backup-premium-am@domain.com",
          password: "BackupPassword123",
          expired_at: "Sistem Cadangan Mandiri",
          note: "Infrastruktur utama mengalami error mendadak, mengalihkan ke cadangan."
        };
      }
    }

    await supabaseAdmin
      .from('user_generator_logs')
      .insert([{ user_id: user_id }]);

    return NextResponse.json({ success: true, account: resultAccount }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kegagalan penanganan sistem internal.' }, { status: 500 });
  }
}
