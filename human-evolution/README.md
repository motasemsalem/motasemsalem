# رحلة الإنسان — فيديو موشن جرافيك

فيديو عربي (1920×1080، 30 إطار/ث، 88.5 ثانية) يشرح تطور البشرية من السلف المشترك مع الشمبانزي قبل نحو 7 ملايين سنة إلى اليوم، معمول بـ [Remotion](https://www.remotion.dev/).

النسخة المرندرة: [`renders/human-evolution.mp4`](renders/human-evolution.mp4)

## المشاهد

المقدمة · السلف المشترك · لوسي · أول الأدوات · الإنسان المنتصب · ترويض النار · دماغ يكبر · النياندرتال · الإنسان العاقل · الانتشار في العالم · الفن والرموز · الزراعة · الكتابة · الثورة الصناعية · العصر الرقمي · الخاتمة (شجرة التطور)

## التعديل

- النصوص ومدة كل مشهد: `src/HumanEvolution.tsx`
- الرسومات: `src/art/`
- الألوان والخطوط: `src/theme.ts`

```console
npm i
npm run dev                                  # Remotion Studio للمعاينة والتعديل
npx remotion render HumanEvolution out/human-evolution.mp4
```

الخطوط (Alexandria و IBM Plex Sans Arabic) موجودة في `public/fonts` برخصة SIL OFL، فالرندر مش محتاج إنترنت.
