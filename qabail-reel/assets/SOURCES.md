# مصادر الأصول وتراخيصها

كل الأصول المستخدمة في الفيديو النهائي مجانية وقانونية للاستخدام (بما فيه الاستخدام التجاري)، والمطلوب منها نسبة (attribution) مذكور تحت.

## صور أرشيفية — `assets/photos/`
من **مكتبة الكونجرس الأمريكية (Library of Congress)**، أغلبها من مجموعة **G. Eric and Edith Matson** (American Colony Photo Dept.) وصور ستيريو قديمة لمصر.
الحالة: **"No known restrictions on publication"** — لا توجد قيود نشر معروفة (ملكية عامة).
تم قصّ كل صورة (نص واحد من صور الستيريو) وتوحيد لونها بنفس التدريج (سيبيا ذهبي) في `build/prep_photos.py`. الملف `assets/photos/photos.json` فيه رابط الأصل لكل صورة.

| الملف | العنوان الأصلي | التاريخ | المصدر |
|---|---|---|---|
| `assouan-1856.jpg` | Assouan | 1856-01-01 | [2004671997](https://www.loc.gov/item/2004671997/) |
| `azhar-court.jpg` | The Mosque el Azhar, (Court), Cairo, Egypt | 1899-01-01 | [2019636353](https://www.loc.gov/item/2019636353/) |
| `azhar-minarets-1867.jpg` | Caire. Mosquée el-Azhar, vue générale des minarets / Bonfils. | 1867-01-01 | [2004668146](https://www.loc.gov/item/2004668146/) |
| `bedouin-horseman.jpg` | Bedouin man mounted on horse | 1898-01-01 | [2019712991](https://www.loc.gov/item/2019712991/) |
| `bedouin-horsemen-line.jpg` | [Line of Bedouin men with rifles on horseback] | 1921-01-01 | [2008676391](https://www.loc.gov/item/2008676391/) |
| `bedouin-of-sinai.jpg` | To Sinai via the Red Sea, Tor, and Wady Hebran. Bedouin of Sinai | 1900-01-01 | [2019695789](https://www.loc.gov/item/2019695789/) |
| `bedouins-coffee-tent.jpg` | Costumes, characters, etc. Bedouins preparing coffee in their tent | 1900-01-01 | [2019692805](https://www.loc.gov/item/2019692805/) |
| `bedouins-horses.jpg` | A Group of Bedouins with Their Horses. | 1915-01-01 | [2021671006](https://www.loc.gov/item/2021671006/) |
| `campfire-sinai.jpg` | To Sinai via the Red Sea, Tor, and Wady Hebran. Typical scene around the campfire at night | 1900-01-01 | [2019695801](https://www.loc.gov/item/2019695801/) |
| `coffee-pots-fire.jpg` | Bedouin life in Trans-Jordan. An array of coffee pots around the fire | 1920-01-01 | [2019706440](https://www.loc.gov/item/2019706440/) |
| `delta-air-view.jpg` | Air views of Palestine. Flight down the delta of the Nile to Alexandria. Villages in the N | 1932-01-01 | [2019706697](https://www.loc.gov/item/2019706697/) |
| `feiran-bedouin-tents.jpg` | Sinai. Wady Feiran, Bedouin tents | 1950-01-01 | [2019705674](https://www.loc.gov/item/2019705674/) |
| `feiran-palm-grove.jpg` | Sinai. Wady Feiran, luxurious palm grove | 1950-01-01 | [2019705672](https://www.loc.gov/item/2019705672/) |
| `first-cataract-1856.jpg` | [The 1st cataract of the Nile] | 1856-01-01 | [2004671994](https://www.loc.gov/item/2004671994/) |
| `jebel-mousa.jpg` | Sinai, Jebel Mousa | 1898-01-01 | [2019700062](https://www.loc.gov/item/2019700062/) |
| `jebel-musa-summit.jpg` | Sinai. The Summit of Jebel Mousa | 1898-01-01 | [2019698509](https://www.loc.gov/item/2019698509/) |
| `mosque-amru.jpg` | Mosque of Amru, Cairo, Egypt | 1903-01-01 | [2019639364](https://www.loc.gov/item/2019639364/) |
| `old-bedouin-sheikh.jpg` | To Sinai via the Red Sea, Tor, and Wady Hebran. Old Bedouin sheikh | 1900-01-01 | [2019695790](https://www.loc.gov/item/2019695790/) |
| `sinai-caravan-elkaa.jpg` | Sinai. Caravan in the heart of the desert of el-Ka'a (Wilderness of Sin) / American Colony | 1898-01-01 | [2019698567](https://www.loc.gov/item/2019698567/) |
| `sinai-caravan-elwad.jpg` | Sinai. Caravan at el-Wad preparing to cross the desert | 1898-01-01 | [2019698568](https://www.loc.gov/item/2019698568/) |
| `upper-egypt-village.jpg` | A native village of Upper Egypt | 1904-01-01 | [2019637476](https://www.loc.gov/item/2019637476/) |
| `upper-nile-village.jpg` | A typical village of the Upper Nile, Egypt | 1896-01-01 | [2019637135](https://www.loc.gov/item/2019637135/) |
| `village-sheik-children.jpg` | Children of a village Sheik, Upper Egypt | 1896-01-01 | [2019637502](https://www.loc.gov/item/2019637502/) |

## الخرائط — `assets/map/`
- **صور الأقمار الصناعية:** *Sentinel-2 cloudless 2016* — https://s2maps.eu by **EOX IT Services GmbH** (Contains modified Copernicus Sentinel data 2016). الترخيص: **CC BY 4.0**. النسبة مكتوبة على الشاشة في مشاهد الخريطة.
  (ملاحظة: إصدارات 2018 وما بعدها ترخيصها غير تجاري — استخدمنا إصدار 2016 فقط.) الموزاييك متركّب في `build/fetch_map.py`.
- **الحدود والأنهار والمحافظات:** **Natural Earth** (ملكية عامة) — https://www.naturalearthdata.com

## موسيقى — `assets/music/`
كلها من **Kevin MacLeod (incompetech.com)**، ترخيص **Creative Commons: By Attribution 4.0** — https://creativecommons.org/licenses/by/4.0/

| التراك | الاستخدام في الفيديو |
|---|---|
| Lightless Dawn | الهوك (تشويق) |
| Desert City | الهجرات الأولى (عربي، عود وطبلة) |
| Ancient Rite | بنو هلال وبنو سليم (ملحمي) |
| Dark Times | كشف هوّارة (تشويق) |
| Ibn Al-Noor | أولاد علي وجولة الخريطة والختام (عربي هادي) |

**نص النسبة المطلوب في وصف الفيديو:**
```
Music by Kevin MacLeod (incompetech.com) — "Lightless Dawn", "Desert City", "Ancient Rite", "Dark Times", "Ibn Al-Noor"
Licensed under Creative Commons: By Attribution 4.0 — http://creativecommons.org/licenses/by/4.0/
Map imagery: Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0) · Natural Earth
Archival photographs: Library of Congress, Prints & Photographs Division (Matson Collection)
```

## مؤثرات صوتية
مولّدة بالكامل بالكود (ffmpeg: موجات ونويز مفلتر) في `build/render_reel.py` — خفيفة وفي اللحظات الكبيرة بس. مفيش حقوق لطرف تالت.

## خطوط — `fonts/` (كلها SIL Open Font License 1.1)
- **Aref Ruqaa** — الكلمات المفتاحية وأسماء القبائل.
- **Amiri** — الجمل التمهيدية والأرقام.
- **Cairo** — الترجمة (الكاريوكي) والكروت.
- خط Dubai المذكور في PLAN.md مكانش موجود في الحزمة؛ Cairo هو البديل الأقرب.

## مصادر حاولنا نستخدمها ومتاحتش من البيئة
- Pexels وPixabay: بيرفضوا الوصول الآلي (403) ومن غير مفاتيح API.
- Wikimedia Commons: حظر مؤقت للطلبات (429). Gallica (BnF): 403.
