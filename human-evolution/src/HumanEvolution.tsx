import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp } from "./anim";
import {
  DivergenceArt,
  FireArt,
  FootprintsArt,
  HeightArt,
  StoneToolArt,
} from "./art/early";
import {
  BrainChartArt,
  DispersalArt,
  DnaArt,
  HandsArt,
  SapiensPinArt,
} from "./art/middle";
import { GearsArt, NetworkArt, TabletArt, WheatArt } from "./art/modern";
import { Closing } from "./components/Closing";
import { Intro } from "./components/Intro";
import { SceneLayout } from "./components/SceneLayout";
import { Ambience, Sfx, Voice } from "./components/Sound";
import { type HumanEvolutionProps, TRANSITION_FRAMES } from "./voiceover";

const cut = () => (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
  />
);

export const HumanEvolution: React.FC<HumanEvolutionProps> = ({
  sceneFrames,
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Audio
        name="موسيقى"
        src={staticFile("music/ambient.mp3")}
        durationInFrames={durationInFrames}
        volume={(f) =>
          interpolate(
            f,
            [0, 60, durationInFrames - 90, durationInFrames],
            [0, 0.13, 0.13, 0],
            clamp,
          )
        }
      />
      <TransitionSeries>
        <TransitionSeries.Sequence
          name="مقدمة"
          durationInFrames={sceneFrames.intro}
        >
          <Intro />
          <Voice id="intro" />
          <Sfx name="boom" at={14} volume={0.55} />
          <Sfx name="shimmer" at={34} volume={0.18} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="السلف المشترك"
          durationInFrames={sceneFrames.ancestor}
        >
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
          <Voice id="ancestor" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="whoosh" at={36} volume={0.3} />
          <Sfx name="tick" at={70} volume={0.3} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="لوسي"
          durationInFrames={sceneFrames.lucy}
        >
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
          <Voice id="lucy" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="step" at={12} volume={0.5} />
          <Sfx name="step" at={24} volume={0.5} />
          <Sfx name="step" at={36} volume={0.5} />
          <Sfx name="step" at={48} volume={0.5} />
          <Sfx name="step" at={60} volume={0.5} />
          <Sfx name="step" at={72} volume={0.5} />
          <Sfx name="step" at={84} volume={0.5} />
          <Sfx name="step" at={96} volume={0.5} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الأدوات الحجرية"
          durationInFrames={sceneFrames.tools}
        >
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
          <Voice id="tools" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="knock" at={28} volume={0.6} />
          <Sfx name="knock" at={54} volume={0.6} />
          <Sfx name="knock" at={80} volume={0.6} />
          <Sfx name="shimmer" at={95} volume={0.15} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الإنسان المنتصب"
          durationInFrames={sceneFrames.erectus}
        >
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
          <Voice id="erectus" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="swell" at={10} volume={0.3} />
          <Sfx name="tick" at={60} volume={0.3} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="النار"
          durationInFrames={sceneFrames.fire}
        >
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
          <Voice id="fire" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="whoosh" at={6} volume={0.45} />
          <Ambience name="crackle" at={8} volume={0.4} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="حجم الدماغ"
          durationInFrames={sceneFrames.brain}
        >
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
          <Voice id="brain" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="tick" at={12} volume={0.35} />
          <Sfx name="tick" at={22} volume={0.35} />
          <Sfx name="tick" at={32} volume={0.35} />
          <Sfx name="tick" at={42} volume={0.35} />
          <Sfx name="tick" at={52} volume={0.35} />
          <Sfx name="tick" at={62} volume={0.35} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="النياندرتال"
          durationInFrames={sceneFrames.neanderthal}
        >
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
          <Voice id="neanderthal" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="shimmer" at={4} volume={0.3} />
          <Sfx name="ding" at={55} volume={0.2} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الإنسان العاقل"
          durationInFrames={sceneFrames.sapiens}
        >
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
          <Voice id="sapiens" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="whoosh" at={40} volume={0.35} />
          <Sfx name="ding" at={62} volume={0.4} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الانتشار"
          durationInFrames={sceneFrames.dispersal}
        >
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
          <Voice id="dispersal" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="whoosh" at={15} volume={0.25} />
          <Sfx name="whoosh" at={45} volume={0.25} />
          <Sfx name="whoosh" at={70} volume={0.25} />
          <Sfx name="whoosh" at={95} volume={0.25} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الفن"
          durationInFrames={sceneFrames.art}
        >
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
          <Voice id="art" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="spray" at={10} volume={0.4} />
          <Sfx name="spray" at={32} volume={0.4} />
          <Sfx name="spray" at={54} volume={0.4} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الزراعة"
          durationInFrames={sceneFrames.farming}
        >
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
          <Voice id="farming" />
          <Sfx name="whoosh" volume={0.22} />
          <Ambience name="wind" volume={0.35} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الكتابة"
          durationInFrames={sceneFrames.writing}
        >
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
          <Voice id="writing" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="tap" at={18} volume={0.3} />
          <Sfx name="tap" at={23} volume={0.3} />
          <Sfx name="tap" at={28} volume={0.3} />
          <Sfx name="tap" at={34} volume={0.3} />
          <Sfx name="tap" at={39} volume={0.3} />
          <Sfx name="tap" at={44} volume={0.3} />
          <Sfx name="tap" at={49} volume={0.3} />
          <Sfx name="tap" at={54} volume={0.3} />
          <Sfx name="tap" at={60} volume={0.3} />
          <Sfx name="tap" at={65} volume={0.3} />
          <Sfx name="tap" at={70} volume={0.3} />
          <Sfx name="tap" at={75} volume={0.3} />
          <Sfx name="tap" at={80} volume={0.3} />
          <Sfx name="tap" at={86} volume={0.3} />
          <Sfx name="tap" at={91} volume={0.3} />
          <Sfx name="tap" at={96} volume={0.3} />
          <Sfx name="tap" at={101} volume={0.3} />
          <Sfx name="tap" at={106} volume={0.3} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الصناعة"
          durationInFrames={sceneFrames.industry}
        >
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
          <Voice id="industry" />
          <Sfx name="whoosh" volume={0.22} />
          <Ambience name="gears" volume={0.35} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="اليوم"
          durationInFrames={sceneFrames.today}
        >
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
          <Voice id="today" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="blip" at={10} volume={0.25} />
          <Sfx name="blip" at={20} volume={0.25} />
          <Sfx name="blip" at={30} volume={0.25} />
          <Sfx name="blip" at={40} volume={0.25} />
          <Sfx name="blip" at={50} volume={0.25} />
          <Sfx name="blip" at={60} volume={0.25} />
          <Sfx name="blip" at={70} volume={0.25} />
          <Sfx name="blip" at={80} volume={0.25} />
          <Sfx name="blip" at={90} volume={0.25} />
          <Sfx name="blip" at={100} volume={0.25} />
          <Sfx name="blip" at={110} volume={0.25} />
          <Sfx name="blip" at={120} volume={0.25} />
        </TransitionSeries.Sequence>
        {cut()}
        <TransitionSeries.Sequence
          name="الخاتمة"
          durationInFrames={sceneFrames.closing}
        >
          <Closing />
          <Voice id="closing" />
          <Sfx name="whoosh" volume={0.22} />
          <Sfx name="swell" volume={0.35} />
          <Sfx name="boom" at={120} volume={0.4} />
          <Sfx name="ding" at={125} volume={0.3} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
