// src/lib/weatherService.ts

export interface LiveWeatherPayload {
  tempC: number;
  humidityPct: number;
  conditionLabel: string;
  precipitationMm: number;
  locationName: string;
  isLiveApi: boolean;
  fetchedAt: string;
  inferredSeason: 'rainy' | 'summer' | 'winter';
}

export interface WeatherPreset {
  id: string;
  label: string;
  shortBadge: string;
  tempC: number;
  humidityPct: number;
  conditionLabel: string;
  precipitationMm: number;
  season: 'rainy' | 'summer' | 'winter';
  clinicalNote: string;
}

/**
 * รายการจำลองสภาพอากาศทางคลินิก (สำหรับทดสอบภาวะ "อุตุแปรปรวน" เช่น ฤดูฝนแต่แดดออกจัด)
 */
export const CLINICAL_WEATHER_PRESETS: WeatherPreset[] = [
  {
    id: 'RAINY_SUNNY_HOT',
    label: '☀️ ฤดูฝนแต่แดดออกจัด (35°C · ชื้น 50%)',
    shortBadge: 'อุตุแปรปรวน: ร้อนแทรกฤดูฝน',
    tempC: 35,
    humidityPct: 50,
    conditionLabel: 'แดดออกจัด อากาศร้อนแล้งกลางฤดูฝน',
    precipitationMm: 0,
    season: 'rainy',
    clinicalNote: 'แม้ปฏิทินเป็นวสันตฤดู (ฤดูฝน) แต่สภาพอากาศจริงแดดจัดและความชื้นต่ำ กระตุ้นปิตตะสมุฏฐาน (+1.5) แทนวาตะ',
  },
  {
    id: 'HOT_HUMID_MIXED',
    label: '🥵 ร้อนชื้นอบอ้าว ก่อนฝนตก (33°C · ชื้น 75%)',
    shortBadge: 'พหุอุตุ: ร้อนผสมชื้น',
    tempC: 33,
    humidityPct: 75,
    conditionLabel: 'อากาศร้อนอบอ้าวและชื้นจัด (พหุอุตุ)',
    precipitationMm: 0.5,
    season: 'rainy',
    clinicalNote: 'ไอร้อนอบอ้าวร่วมกับความชื้นสูง กระตุ้นทั้งปิตตะสมุฏฐาน (+0.8) และวาตะสมุฏฐาน (+0.7)',
  },
  {
    id: 'RAINY_HUMID_NORMAL',
    label: '🌧️ ฝนตกชุก ความชื้นสูง (28°C · ชื้น 82%)',
    shortBadge: 'วสันตอุตุแท้ (ชื้น/ฝน)',
    tempC: 28,
    humidityPct: 82,
    conditionLabel: 'ฝนตกพรำ ความชื้นสัมพัทธ์สูง',
    precipitationMm: 4.2,
    season: 'rainy',
    clinicalNote: 'สภาพอากาศชื้นและมีไอฝนตรงตามวสันตฤดู กระตุ้นวาตะสมุฏฐาน (+1.5)',
  },
  {
    id: 'COOL_WINTER',
    label: '❄️ อากาศหนาวเย็นลงฉับพลัน (22°C · ชื้น 55%)',
    shortBadge: 'เหมันตอุตุ (อากาศเย็น)',
    tempC: 22,
    humidityPct: 55,
    conditionLabel: 'อากาศเย็นอุณหภูมิลดต่ำ',
    precipitationMm: 0,
    season: 'winter',
    clinicalNote: 'ความเย็นภายนอกกระตุ้นให้เสมหะสมุฏฐานและธาตุน้ำกำเริบ (+1.5)',
  },
];

/**
 * แปลงรหัสสภาพอากาศ WMO Weather Code จาก Open-Meteo เป็นคำอธิบายภาษาไทยทางเวชกรรม
 */
function mapWmoWeatherCodeToThai(code: number, tempC: number, humidityPct: number): string {
  if (code === 0 || code === 1) {
    return tempC >= 33 ? 'ท้องฟ้าโปร่ง แดดจัดร้อนอบอ้าว' : 'ท้องฟ้าแจ่มใส มีแสงแดด';
  }
  if (code === 2 || code === 3) {
    return humidityPct >= 70 ? 'มีเมฆมาก อากาศชื้นอบอ้าว' : 'มีเมฆบางส่วน';
  }
  if (code >= 45 && code <= 48) {
    return 'มีหมอกและไอชื้นสะสม';
  }
  if (code >= 51 && code <= 67) {
    return 'มีฝนตกพรำและไอฝนชื้น';
  }
  if (code >= 80 && code <= 82) {
    return 'มีฝนฟ้าคะนองและความชื้นสูง';
  }
  if (code >= 95) {
    return 'พายุฝนฟ้าคะนอง ลมกระโชกแรง';
  }
  return tempC >= 33 ? 'อากาศร้อนจัด' : humidityPct >= 70 ? 'อากาศชื้นสัมพัทธ์สูง' : 'สภาพอากาศปกติ';
}

/**
 * ประเมินฤดูกาลตามปฏิทินไทยจากเดือนปัจจุบัน
 */
export function getThaiCalendarSeason(date = new Date()): 'rainy' | 'summer' | 'winter' {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 6) return 'summer'; // มี.ค. - มิ.ย. (คิมหันตฤดู)
  if (month >= 7 && month <= 10) return 'rainy'; // ก.ค. - ต.ค. (วสันตฤดู)
  return 'winter'; // พ.ย. - ก.พ. (เหมันตฤดู)
}

/**
 * ดึงข้อมูลสภาพอากาศจริงแบบ Real-time จาก Open-Meteo API
 * รองรับทั้งการขอพิกัด GPS จากเบราว์เซอร์ หรือใช้พิกัดเริ่มต้น (กรมการแพทย์แผนไทยฯ จ.นนทบุรี)
 */
export async function fetchRealTimeWeather(
  customCoords?: { lat: number; lon: number; locationName?: string }
): Promise<LiveWeatherPayload> {
  let lat = customCoords?.lat ?? 13.8591;
  let lon = customCoords?.lon ?? 100.5217;
  let locationName = customCoords?.locationName ?? 'นนทบุรี (กรมการแพทย์แผนไทยฯ)';

  // หากไม่ได้ส่งพิกัดมา ให้ลองดึงจาก Geolocation ของเบราว์เซอร์ภายในเวลา 2.5 วินาที
  if (!customCoords && typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 2500,
          maximumAge: 60000,
        });
      });
      lat = Number(pos.coords.latitude.toFixed(4));
      lon = Number(pos.coords.longitude.toFixed(4));
      locationName = `พิกัดจุดตรวจปัจจุบัน (${lat}, ${lon})`;
    } catch {
      // หากผู้ใช้ไม่อนุญาต GPS หรืออยู่ในอาคาร ให้ใช้พิกัดกรมการแพทย์แผนไทยฯ จ.นนทบุรี แทน
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&timezone=Asia%2FBangkok`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Weather API responded with status ${res.status}`);
  }

  const data = await res.json();
  const cur = data.current || {};

  const tempC = Math.round(typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 31);
  const humidityPct = Math.round(typeof cur.relative_humidity_2m === 'number' ? cur.relative_humidity_2m : 70);
  const precipitationMm = Number((cur.precipitation ?? 0).toFixed(1));
  const weatherCode = typeof cur.weather_code === 'number' ? cur.weather_code : 2;

  const conditionLabel = mapWmoWeatherCodeToThai(weatherCode, tempC, humidityPct);
  const nowStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return {
    tempC,
    humidityPct,
    conditionLabel,
    precipitationMm,
    locationName,
    isLiveApi: true,
    fetchedAt: `${nowStr} น.`,
    inferredSeason: getThaiCalendarSeason(),
  };
}
