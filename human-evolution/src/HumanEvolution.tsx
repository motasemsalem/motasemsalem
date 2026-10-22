import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {useVideoConfig} from 'remotion';
import {DivergenceArt, FireArt, FootprintsArt, HeightArt, StoneToolArt} from './art/early';
import {BrainChartArt, DispersalArt, DnaArt, HandsArt, SapiensPinArt} from './art/middle';
import {GearsArt, NetworkArt, TabletArt, WheatArt} from './art/modern';
import {Closing} from './components/Closing';
import {Intro} from './components/Intro';
import {SceneLayout} from './components/SceneLayout';

export const TRANSITION_FRAMES = 15;

const cut = () => (
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION_FRAMES})} />
);

export const HumanEvolution: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="مقدمة" durationInFrames={5 * fps}>
        <Intro />
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="السلف المشترك" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ نحو 7 ملايين سنة"
          title="السلف المشترك"
          subtitle="افتراق طريق البشر عن الشمبانزي"
          fact="أقدم مرشّح معروف لفرعنا هو «ساحل أنثروبوس»، وعُثر عليه في تشاد."
          yearsAgo={7_000_000}
          prevYearsAgo={7_000_000}
        >
          <DivergenceArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="لوسي" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ 3.2 مليون سنة"
          title="لوسي"
          subtitle="المشي على قدمين"
          fact="هيكل «لوسي» من إثيوبيا كان يمشي منتصبًا، وآثار أقدام لاتولي في تنزانيا تشهد بذلك منذ 3.6 مليون سنة."
          yearsAgo={3_200_000}
          prevYearsAgo={7_000_000}
        >
          <FootprintsArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الأدوات الحجرية" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ 2.6 مليون سنة"
          title="أول الأدوات"
          subtitle="الإنسان الماهر · هومو هابيليس"
          fact="طرق الحجر بالحجر ليصنع حوافّ حادة يقطع بها اللحم ويكسر العظام."
          yearsAgo={2_600_000}
          prevYearsAgo={3_200_000}
        >
          <StoneToolArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الإنسان المنتصب" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ 1.9 مليون سنة"
          title="الإنسان المنتصب"
          subtitle="جسد يشبه أجسامنا"
          fact="ساقان طويلتان للمشي مسافات بعيدة، وكان أول من غادر أفريقيا قبل نحو 1.8 مليون سنة."
          yearsAgo={1_900_000}
          prevYearsAgo={2_600_000}
        >
          <HeightArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="النار" durationInFrames={5.5 * fps}>
        <SceneLayout
          era="منذ نحو مليون سنة"
          title="ترويض النار"
          subtitle="دفء، وحماية، وطعام مطهو"
          fact="الطهي سهّل الهضم ووفّر طاقة أكبر لدماغ يكبر باستمرار."
          yearsAgo={1_000_000}
          prevYearsAgo={1_900_000}
        >
          <FireArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="حجم الدماغ" durationInFrames={7 * fps}>
        <SceneLayout
          era="على مدى ملايين السنين"
          title="دماغ يكبر"
          subtitle="متوسط الحجم بالسنتيمتر المكعب"
          fact="تضاعف حجم الدماغ نحو ثلاث مرات منذ أسلافنا الأوائل."
          yearsAgo={1_000_000}
          prevYearsAgo={1_000_000}
        >
          <BrainChartArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="النياندرتال" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ 400 ألف إلى 40 ألف سنة"
          title="النياندرتال"
          subtitle="أبناء عمومتنا في أوروبا وآسيا"
          fact="دفنوا موتاهم وصنعوا أدوات متقنة، ويحمل معظم البشر خارج أفريقيا اليوم جزءًا صغيرًا من حمضهم النووي."
          yearsAgo={400_000}
          prevYearsAgo={1_000_000}
        >
          <DnaArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الإنسان العاقل" durationInFrames={6 * fps}>
        <SceneLayout
          era="منذ نحو 300 ألف سنة"
          title="الإنسان العاقل"
          subtitle="هومو سابينس · نحن"
          fact="أقدم أحافيرنا المعروفة جاءت من جبل إيغود في المغرب."
          yearsAgo={300_000}
          prevYearsAgo={400_000}
        >
          <SapiensPinArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الانتشار" durationInFrames={7 * fps}>
        <SceneLayout
          era="منذ 70 إلى 50 ألف سنة"
          title="الانتشار في العالم"
          subtitle="من أفريقيا إلى كل القارات"
          fact="على مدى عشرات آلاف السنين وصل البشر إلى آسيا وأستراليا وأوروبا ثم الأمريكتين."
          yearsAgo={60_000}
          prevYearsAgo={300_000}
        >
          <DispersalArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الفن" durationInFrames={5.5 * fps}>
        <SceneLayout
          era="منذ أكثر من 40 ألف سنة"
          title="الفن والرموز"
          subtitle="الخيال يترك أثره على الجدران"
          fact="رسوم الكهوف وبصمات الأيدي دليل على تفكير رمزي ولغة معقدة."
          yearsAgo={45_000}
          prevYearsAgo={60_000}
        >
          <HandsArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الزراعة" durationInFrames={5.5 * fps}>
        <SceneLayout
          era="منذ نحو 12 ألف سنة"
          title="الزراعة"
          subtitle="من الصيد والترحال إلى القرى"
          fact="في الهلال الخصيب زُرع القمح والشعير أول مرة، فاستقر الناس ونشأت القرى."
          yearsAgo={12_000}
          prevYearsAgo={45_000}
        >
          <WheatArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الكتابة" durationInFrames={5.5 * fps}>
        <SceneLayout
          era="منذ نحو 5200 سنة"
          title="الكتابة"
          subtitle="الذاكرة تُحفظ خارج العقل"
          fact="في سومر ومصر ظهرت أولى أنظمة الكتابة: المسمارية والهيروغليفية."
          yearsAgo={5_200}
          prevYearsAgo={12_000}
        >
          <TabletArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الصناعة" durationInFrames={5 * fps}>
        <SceneLayout
          era="منذ نحو 250 سنة"
          title="الثورة الصناعية"
          subtitle="الآلة تغيّر كل شيء"
          fact="المحركات البخارية والمصانع ضاعفت الإنتاج وغيّرت شكل المدن والحياة."
          yearsAgo={250}
          prevYearsAgo={5_200}
        >
          <GearsArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="اليوم" durationInFrames={6 * fps}>
        <SceneLayout
          era="اليوم"
          title="العصر الرقمي"
          subtitle="أكثر من 8 مليارات إنسان"
          fact="في 250 سنة فقط انتقلنا من البخار إلى الإنترنت والذكاء الاصطناعي واستكشاف الفضاء."
          yearsAgo={1}
          prevYearsAgo={250}
        >
          <NetworkArt />
        </SceneLayout>
      </TransitionSeries.Sequence>
      {cut()}
      <TransitionSeries.Sequence name="الخاتمة" durationInFrames={8 * fps}>
        <Closing />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
