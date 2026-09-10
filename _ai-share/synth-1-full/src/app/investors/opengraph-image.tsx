import { ImageResponse } from 'next/og';

export const alt = 'Syntha — Fashion OS: от артикула до закрытия заказа';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#020617',
          color: '#f8fafc',
          padding: '68px 76px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                background: '#0369a1',
                fontSize: 27,
                fontWeight: 700,
              }}
            >
              S
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em' }}>
              SYNTHA
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              border: '1px solid #334155',
              borderRadius: 999,
              padding: '10px 18px',
              color: '#bae6fd',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            FASHION OS · PLATFORM CORE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1020 }}>
          <div
            style={{
              color: '#38bdf8',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            ЕДИНАЯ ОПЕРАЦИОННАЯ СРЕДА
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 62,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.045em',
            }}
          >
            От артикула до закрытия заказа
          </div>
          <div
            style={{ marginTop: 26, color: '#cbd5e1', fontSize: 27, lineHeight: 1.35 }}
          >
            Бренд · Магазин · Производитель · Поставщик — в одном сквозном fashion-процессе
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            color: '#94a3b8',
            fontSize: 18,
          }}
        >
          <span>Разработка</span>
          <span>→</span>
          <span>Коллекция</span>
          <span>→</span>
          <span>Заказ</span>
          <span>→</span>
          <span>Производство</span>
          <span>→</span>
          <span>Поставка</span>
        </div>
      </div>
    ),
    size
  );
}
