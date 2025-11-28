import { MobileMenu } from '../components/MobileMenu';

const principles = ['안전 우선', '40분 내 메이크업', '아티스트 보호', '개인정보 비공개'];
const serviceTypes = ['헤어', '메이크업', '헤어 + 메이크업'];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">524</p>
          <MobileMenu />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-12 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">524</span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              어디서 예뻐지실 건가요?
            </h1>
            <p className="text-lg text-slate-600">
              서울 중심의 프리미엄 뷰티 아티스트를 한 번에 찾아 예약하세요. 안전과 시간, 그리고 품질을 보장하는
              한국 맞춤형 뷰티 마켓플레이스입니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl"
                href="/dashboard"
              >
                지금 예약 시작하기
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary/80 hover:text-primary/80"
                href="/dashboard"
              >
                아티스트 대시보드
              </a>
            </div>
          </div>

          <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl shadow-slate-200/50 backdrop-blur">
            <div>
              <h2 className="text-sm font-semibold text-slate-500">핵심 원칙</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {principles.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-500">서비스 유형</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {serviceTypes.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-primary">오늘의 일정</p>
              <p className="mt-2 text-sm text-slate-600">데이트 · 면접 · 웨딩 · 사진촬영까지 상황별 맞춤 추천 제공</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900">아티스트를 위한 스마트 대시보드</h3>
          <p className="mt-2 text-sm text-slate-600">
            실시간 예약 관리, 수익 분석, 안전 프로토콜 체크리스트까지 올인원으로 제공합니다.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[{ title: '실시간 예약', value: '연동된 스케줄링' }, { title: '고객 소통', value: '인앱 메시지 + 알림' }, { title: '정산', value: '한국 PG 완전 지원' }].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-500">{item.title}</p>
                <p className="mt-2 text-base text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


