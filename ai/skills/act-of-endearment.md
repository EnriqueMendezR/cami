# Partner Angle — Love Letter Reaction Videos

## What This Skill Does

Generates 4-second vertical videos of a White woman reacting to a love letter her partner sent her via the app. The goal is social proof through authentic emotion — the viewer sees the *effect* of the letter, not the letter itself. The winning format is Format 2: a fixed camera on her face, infatuated and lost in thought, with large text overlaid that tells the story.

---

## Format Bank

### Format 2 — Narrative Text Story (PRIMARY FORMAT) ✓
A White woman filmed by a fixed camera. No phone in frame. She's not looking at the camera — gaze drifts softly, eyes downward or to the side, infatuated and lost in thought like she's replaying something she just read. Soft involuntary smile. Warm dreamy expression. Dim amber lighting, golden tones, cozy bedroom. Bold text covers the upper portion of the frame — large enough to partially cover her face. Max 3 bullet points. Text present from frame one, never animated.

**Vibe:** dreamy, warm, caught in a feeling — the text tells the story, her face sells it

**Best for:** high relatability, shares and saves, broad audience

---

### Format 1 — Short Reaction Hook
Selfie-style. Woman reads a love letter on her phone, expression shifts. Short punchy single-line text overlay. Candid and raw.

**Vibe:** caught off guard, covering mouth, disbelief

**Best for:** quick scroll-stop

---

### Format 3 — Sigh Relief
Woman exhales slowly — a long, quiet, overwhelmed sigh. Eyes close then reopen soft. No phone in hand. Text appears after the sigh lands.

**Vibe:** wordless overwhelm → text confirms what just happened

**Best for:** emotional authenticity, high save rate

---

## Text Overlay Bank (Format 2)

**Design intent:** Each overlay teases a silly gift or surprise he did — this video is the setup. A virtual love letter he wrote follows immediately after as the payoff. The text should make the viewer smile and stay curious about what comes next.

Structure: short relatable header → the silly thing he did (1–3 bullets max) → charmed reaction closer

```
he showed up with:
- her favorite snacks
- a stuffed animal
- and apparently a whole letter 🥹
```

```
random tuesday
he left on the doorstep:
- her favorite flowers
- a burrito
- and something she didn't expect 😭
```

```
he's not a romantic person
never has been
- got her a spatula for her birthday once
so why is she crying right now 🥹
```

```
he surprised her with
the most useless gift she's ever received
and somehow also the sweetest thing
anyone has ever written her 😮‍💨
```

```
3 years together
he still:
- buys her silly little things
- shows up when she least expects it
- somehow always knows what to say 🥹
```

```
he got her a:
- random plushie
- her go-to comfort snack
- and a note she wasn't ready for 😭
```

### Format 1 — Short Reaction (Punchy)
- `"wow... he actually shocked me 😭"`
- `"I was NOT expecting that 🥹"`
- `"he's never been good with words... until now"`
- `"ok WHO helped him write this 😭"`
- `"10 years together and he still makes me feel like this 🥺"`

### Format 3 — Sigh Relief (Post-sigh text)
- `"words she's been waiting years to hear."`
- `"one message. everything changed."`
- `"she didn't know he had it in him."`

---

## Prompt Architecture

### Input
- A format number (2 is default)
- A text overlay from the bank, or auto-pick
- A duration (default: 4s)
- A language ("english" default, "spanish" for LatAm casual)
- Nothing — skill auto-picks everything

### Language Handling
- Default: English
- If "spanish" or "es" → translate text overlay to casual Latin American Spanish
- Prompt description stays in English regardless

---

## Prompt Templates

### Template 2 — Narrative Text Story (PRIMARY)

```
4-second vertical video (9:16), casual and authentic. No sound. No music. Silent.

A White woman in her [mid-to-late 20s], filmed by a fixed front-facing camera at eye level. She is not holding anything — hands relaxed and at rest. No phone visible in frame at any point. Her gaze drifts softly — eyes cast slightly downward or off to one side, not looking into the camera. She looks infatuated and lost in thought, like she's replaying something she just read and can't stop smiling about. Soft, involuntary smile. Warm and dreamy — the expression of someone completely caught up in a feeling. Not posed. Not aware of the camera.

Dim amber lighting — like a single bedside lamp or candlelight. Warm golden tones throughout. Cozy bedroom in the background, softly glowing. No overhead lights. Edges of the frame darker, light centered on her face. One unbroken shot, no cuts.

Bold white sans-serif text with a subtle drop shadow is overlaid across the upper portion of the frame from the very first frame and stays the entire clip — large enough to partially cover her face. The text is clean, left-aligned, and reads on separate lines exactly as follows:

[HEADER LINE]
[CONTEXT LINE]
- [BULLET 1]
- [BULLET 2]
- [BULLET 3 + EMOJI]

Maximum 3 bullet points. No slashes between lines. Each line on its own row. Text is fully readable immediately — no animation, no fade.

9:16 vertical. 4 seconds. No audio. Silent.
```

**CRITICAL — text formatting rule:** NEVER use `/` as line separators anywhere in the prompt. The model renders them literally in the video. Always write the text block as explicit separate lines.

---

### Template 1 — Short Reaction Hook

```
4-second vertical selfie video (9:16), authentic and candid. No sound. No music. Silent.

A White woman in her [mid-to-late 20s] films herself with a front-facing camera at home — cozy bedroom or living room, warm amber lighting. She is reading something on her phone. Her expression shifts — [EXPRESSION: mouth slightly falling open / eyes going glossy / slow disbelieving smile]. Candid, raw, completely unscripted-feeling. Handheld, slight natural camera shake.

Bold white sans-serif text overlaid at the top of the frame reads:
"[SHORT TEXT OVERLAY]"

9:16 vertical. 4 seconds. No audio. Silent.
```

---

### Template 3 — Sigh Relief

```
4-second vertical video (9:16), intimate and quiet. No sound. No music. Silent.

A White woman in her [mid-to-late 20s], filmed in soft dim amber lighting — sitting in a cozy bedroom. She has just finished reading something. No phone in hand. The video opens on her face — still, processing. Then she exhales slowly — a long, quiet sigh, eyes closing briefly then reopening soft and warm. Her hand drifts to her chest. One continuous uncut moment.

At 3s, bold white sans-serif text fades in:
"[POST-SIGH TEXT]"

9:16 vertical. 4 seconds. No audio. Silent.
```

---

## Example Output — Format 2

**Text overlay:**
```
he showed up with:
- her favorite snacks
- a stuffed animal
- and apparently a whole letter 🥹
```

**Prompt:**
> 4-second vertical video (9:16), casual and authentic. No sound. No music. Silent. A White woman in her mid-20s, filmed by a fixed front-facing camera at eye level. She is not holding anything — hands relaxed and at rest. No phone visible in frame. Her gaze drifts softly — eyes cast slightly downward or off to one side, not looking into the camera. She looks infatuated and lost in thought, like she's replaying something she just read and can't stop smiling about. Soft, involuntary smile. Warm and dreamy — the expression of someone completely caught up in a feeling. Not posed. Not aware of the camera. Dim amber lighting — like a single bedside lamp. Warm golden tones throughout. Cozy bedroom in the background, softly glowing. No overhead lights. Edges of the frame darker, light centered on her face. One unbroken shot, no cuts. Bold white sans-serif text with a subtle drop shadow is overlaid across the upper portion of the frame from the very first frame and stays the entire clip — large enough to partially cover her face. The text is clean, left-aligned, and reads on separate lines exactly as follows:
> he showed up with:
> - her favorite snacks
> - a stuffed animal
> - and apparently a whole letter 🥹
> No slashes. Each line on its own row. Text fully readable immediately, no animation, no fade. 9:16 vertical. 4 seconds. No audio. Silent.

---

## Settings (Always)

| Setting | Value |
|---|---|
| Model | Seedance 2.0 |
| Duration | 4s |
| Aspect Ratio | 9:16 |
| Resolution | 720p |
| Audio | None / Silent |

---

## Default Behavior — No Input Required

1. Default to Format 2
2. Auto-pick text overlay from the Format 2 bank — rotate, don't repeat recent ones
3. Output the full Seedance 2.0 prompt immediately — no questions, no confirmation
4. Log to `partner-traceability.md` automatically

Override syntax: `/partner-angle — format 1, spanish`

**Output format — keep it tight:**
- One line: format + text overlay summary
- The full prompt block
- Settings table
- Nothing else
