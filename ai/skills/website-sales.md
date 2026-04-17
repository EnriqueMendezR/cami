# Income Hook — Website Sales Proof of Concept Videos

## What This Skill Does

Generates 5-second vertical selfie-style hook videos for a website-selling SaaS platform. The format: a person in a scenario (everyday or aspirational) with bold text overlay showing they made money selling websites — while doing something completely unrelated to work. Goal is to sell the dream of passive/easy income through the platform.

Visual style reference: authentic TikTok selfie, handheld camera, person looking directly at lens with a shocked or smug expression, bold white text at top of frame.

---

## Scenario Bank

### Everyday / Relatable Scenarios
These make the viewer think: "if they can do it there, I can do it anywhere."

| Scenario | Visual Setting | Vibe |
|---|---|---|
| Gym | Weight room, squat rack in background, gym clothes | Pumped, disbelief |
| School / Lecture | Lecture hall, backpack on, AirPods in | Smug, shocked |
| Grocery store | Shopping cart, store aisle | Casual disbelief |
| In the car | Parked, steering wheel visible, window light | Candid, real |
| Just woke up | Bed, messy hair, morning light | Half-asleep shock |
| Coffee shop | Laptop open, latte on table | Calm confidence |
| Public transit | Subway or bus seat, headphones | Low-effort flex |
| Barbershop | Mid-haircut, cape on | Caught off guard |
| Couch / living room | TV in background, casual clothes | Effortless |
| On a walk | Outdoor path, earbuds in, natural light | Casual |

### Aspirational / Result Scenarios
These show what's possible — the lifestyle the platform unlocks.

| Scenario | Visual Setting | Vibe |
|---|---|---|
| Beach | Ocean behind them, sand, golden light | Relaxed, winning |
| Bahamas / resort pool | Crystal water, pool chair, resort visible | Luxury, disbelief |
| Yacht / boat | Open water, deck behind them, sun | Rich, casual |
| Fancy restaurant | White tablecloth, dim lighting, wine glass | Dressed up, shocked |
| Airport / lounge | Terminal or first-class lounge, luggage | On the move |
| Hotel balcony | City or ocean view, robe or casual | Morning flex |
| Sports car | Interior shot, leather seat, dashboard | Speed, status |
| Rooftop bar | City skyline at dusk, cocktail in hand | Celebration |
| Private jet | Leather seat, window, clouds outside | Aspirational peak |
| Mountain / hike | Summit view, outdoors, breathless | Adventure + income |

---

## Text Overlay Formats

Pick one based on the scenario and income amount:

**Relatable / Everyday:**
- `"Made $[X] selling websites... while at the [location] 🤯"`
- `"Charged them $[X] WHILE at the [location] 😤"`
- `"Just closed a $[X] website deal from [location]"`
- `"$[X] hit while I was [activity] 💀"`
- `"My phone made $[X] while I [activity]"`

**Aspirational:**
- `"Making $[X] from my phone in the [location] 🌴"`
- `"Sold another website from the [location]. $[X]."`
- `"[Location]. $[X] made. No laptop needed. 📱"`
- `"Closed $[X] while on vacation. This is crazy."`
- `"Built this from my phone. Now I'm in [location]. $[X]/month."`

**Income amount guidance:**
- Entry-level feel: $500–$1,500
- Mid-tier: $2,000–$5,000
- Aspirational: $10,000+
- Match the amount to the scenario — gym = $500–2K, yacht = $10K+

---

## Prompt Architecture

### Input
User provides one of:
- A scenario name (e.g. "gym", "beach", "yacht")
- A vibe (e.g. "relatable", "aspirational", "luxury")
- A gender (e.g. "young woman", "man", "woman", "any") — defaults to whatever fits naturally
- Nothing — skill picks the best scenario and generates everything

### Gender Handling
- If user specifies **"young man"** or **"man"** → use male subject
- If user specifies **"young woman"** or **"woman"** → use female subject
- If user specifies **"any"** or nothing → pick whatever feels natural for the scenario
- Outfit and expression language should match the chosen gender naturally

### Ethnicity Handling
- If user specifies an ethnicity → use it exactly as described in the prompt
- If unspecified → pick naturally. No requirement to rotate or enforce diversity across prompts.
- Supported options (non-exhaustive): Black, Latino/Latina, White, Asian, South Asian, Middle Eastern, mixed race, etc.
- Include ethnicity naturally in the subject description, e.g. "A young Black woman in her mid-20s..." or "A Latino man in his early 20s..."

### Language Handling
- If user specifies **"english"** or **"en"** → text overlay in English
- If user specifies **"spanish"** or **"es"** → text overlay in Spanish
- If unspecified → default to English
- The language applies to the **text overlay only** — the prompt description stays in English regardless
- When auto-generating in Spanish, use natural casual Latin American Spanish (not formal/corporate tone)

### Output
1. **Selected scenario** with rationale
2. **Text overlay copy** (ready to paste into CapCut)
3. **Full Seedance 2.0 prompt**
4. **Settings**

---

## Video Styles

### Style A — Direct Selfie (default)
Person films themselves straight on. Face fills most of the frame. Expression is the whole story. Background gives context.

**Template:**
```
5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent.

A [ETHNICITY] [age: young/mid-20s] [man/woman] films themselves with a front-facing camera at/in [LOCATION DESCRIPTION]. They look directly into the camera with a [EXPRESSION] expression — [EXPRESSION DETAIL]. They are wearing [OUTFIT]. Background clearly shows [BACKGROUND DETAILS].

Handheld selfie feel. Slight natural camera shake. Candid and raw.

Bold white sans-serif text overlaid at the top of the frame reads:
"[TEXT OVERLAY]"

9:16 vertical. 3 seconds. No audio. Silent.
```

---

### Style B — Environment Reveal (pan then face)
Person first pans the camera to show off where they are — the view, the room, the setting — then swings it back to their face with the reaction. Two-beat structure: show the world, then show the person reacting to it. Makes the scenario land harder before the caption hits.

**Template:**
```
5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent.

Opens with a handheld pan shot — [ETHNICITY] [man/woman] in their [age] holds the camera out and slowly sweeps it across [LOCATION DETAILS: the view, the room, the setting — describe what the viewer sees]. [Duration: ~2 seconds of environment reveal.] Then the camera swings back to their face in a natural selfie motion. They look directly into the lens with a [EXPRESSION] — [EXPRESSION DETAIL]. Wearing [OUTFIT]. The whole sequence feels like one continuous casual moment, like they're showing a friend where they are.

Handheld, slight shake, candid and real.

Bold white sans-serif text overlaid at the top of the frame reads:
"[TEXT OVERLAY]"

9:16 vertical. 5 seconds. No audio. Silent.
```

**Best scenarios for Style B:**
- Bahamas / resort pool (pan the crystal water and palm trees, then face)
- Hotel balcony (pan the city or ocean view, then face)
- Rooftop bar (pan the skyline at dusk, then face)
- Mountain / hike (pan the summit view, then face)
- Lecture hall (pan the rows of students, then face)
- Fancy restaurant (pan the white tablecloth, dim lighting, then face)
- Gym (pan the weight room, then face)

**Style A is better for:** car, just woke up, couch, barbershop — anywhere the environment is less impressive than the reaction.

---

## Expression Guide by Scenario

| Scenario Type | Expression | Body Language |
|---|---|---|
| Gym | Disbelief, eyebrows up, mouth slightly open | Slight head shake |
| School | Suppressed smirk, looking around | Leaning back |
| Car | Slow exhale, quiet shock | Hand on wheel |
| Beach / Resort | Relaxed smile, slight disbelief | Sunglasses pushed down |
| Yacht | Casual smug, barely reacting | Leaning on rail |
| Restaurant | Eyes wide, covering mouth | Dressed up |
| Just woke up | Sleepy shock, messy hair | Sitting up in bed |

---

## Example Outputs

### Example 1 — Gym
**Text overlay:** `"Charged them $1,500 WHILE at the gym 🤯"`
**Prompt:**
> 5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent. A young man in his mid-20s films himself with a front-facing camera inside a gym. He looks directly into the camera with a wide-eyed disbelief expression — mouth slightly open, eyebrows raised, slight head shake like he can't believe it. He's wearing a hoodie and has AirPods in. Background shows gym equipment, weights, and a dark interior or brick wall. Handheld selfie feel, slight natural camera shake. Candid and raw. Bold white sans-serif text overlaid at the top of the frame reads: "Charged them $1,500 WHILE at the gym 🤯" 9:16 vertical. 5 seconds. No audio.

---

### Example 2 — Beach
**Text overlay:** `"Making $4,000 from my phone in the Bahamas 🌴"`
**Prompt:**
> 5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent. A young man in his mid-20s films himself with a front-facing camera on a beach. He's holding his phone, crystal blue ocean and white sand behind him, golden hour sunlight. He looks directly into the camera with a relaxed smug expression — sunglasses pushed halfway down, slow smile, can't believe his own life. Wearing a linen shirt or swim shorts. Handheld selfie feel, slight breeze movement, natural and candid. Bold white sans-serif text overlaid at the top of the frame reads: "Making $4,000 from my phone in the Bahamas 🌴" 9:16 vertical. 5 seconds. No audio.

---

### Example 3 — Just Woke Up
**Text overlay:** `"$800 hit while I was asleep 💀"`
**Prompt:**
> 5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent. A young man films himself in bed, just woken up — messy hair, sleepy eyes, maybe a plain white t-shirt. Morning light coming through curtains. He holds his phone up, looks directly into camera with slow sleepy shock, eyebrows raised, mouth slightly open like he just checked his phone and couldn't believe the number. Warm, dim bedroom light. Handheld, natural shake. Bold white sans-serif text overlaid at the top of the frame reads: "$800 hit while I was asleep 💀" 9:16 vertical. 5 seconds. No audio.

---

### Example 4 — Fancy Restaurant
**Text overlay:** `"Closed a $5,000 website deal over dinner 🍷"`
**Prompt:**
> 5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent. A young man in his mid-20s films himself at a fancy restaurant — dressed well, dim warm lighting, white tablecloth and wine glass visible in background. He looks directly into the camera with wide eyes and covers his mouth slightly, the expression of someone who just saw a number they weren't expecting. He slowly shakes his head. Handheld, natural shake, intimate lighting. Bold white sans-serif text overlaid at the top of the frame reads: "Closed a $5,000 website deal over dinner 🍷" 9:16 vertical. 5 seconds. No audio.

---

### Example 5 — Lecture Hall
**Text overlay:** `"My phone made $1,200 while I sat in class 😭"`
**Prompt:**
> 5-second vertical selfie video (9:16), authentic TikTok style. No sound. No music. Silent. A young man or woman in their early 20s films themselves in a college lecture hall — backpack on the seat beside them, rows of seats visible behind them, laptop open. They look directly into the camera with a suppressed smirk and wide eyes, like they're trying not to laugh. AirPods in. Casual college outfit. Handheld, real and unpolished. Bold white sans-serif text overlaid at the top of the frame reads: "My phone made $1,200 while I sat in class 😭" 9:16 vertical. 5 seconds. No audio.

---

## Settings (Always)

| Setting | Value |
|---|---|
| Model | Seedance 2.0 |
| Duration | 5s |
| Aspect Ratio | 9:16 |
| Resolution | 720p |
| Audio | None / Silent |

---

## Default Behavior — No Input Required

This skill is designed to run as a zero-input command. When invoked with no arguments:

1. Auto-pick a scenario from the bank (rotate through — do not repeat recent ones)
2. Auto-pick gender (whatever feels natural for the scenario)
3. Auto-pick ethnicity (whatever fits naturally — no rotation requirement)
4. Auto-pick income amount matched to the scenario
5. Auto-select text overlay format
6. Auto-pick Style A or B based on the scenario (use B when the environment is worth showing off)
7. Output the full Seedance 2.0 prompt immediately — no questions, no confirmation

Only deviate from auto if the user explicitly passes an argument (e.g. "income-hook — yacht, woman, $5k, style B").

**Output format — keep it tight:**
- One line: scenario + gender + text overlay
- The full prompt block
- Settings table
- Nothing else
