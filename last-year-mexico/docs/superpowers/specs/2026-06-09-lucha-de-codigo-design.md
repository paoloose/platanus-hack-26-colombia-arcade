# Lucha de Código — Design Specification

**Date:** 2026-06-09
**Game:** Lucha de Código (Platanus Hack 26: CDMX Arcade Challenge)
**Engine:** Phaser 3 (v3.87.0)
**Size Limit:** ≤50KB after minification
**Files:** `game.js`, `metadata.json`, `cover.png`

---

## 1. Game Concept

A vertical side-view wrestling game for a real arcade cabinet. Two luchadores (lucha libre fighters) battle inside a squared ring with ropes. The game is fast, playful, and chaotic — inspired by M.U.S.C.L.E. (NES), Pro Wrestling (NES), and Tag Team Wrestling (NES), but with a simplified, M.U.S.C.L.E.-like toy aesthetic.

**Core loop:** Move → attack → jump → dodge → knockdown → lift → throw → KO. Matches last 60 seconds or until KO.

**Theme:** Mexican lucha libre. The ring apron reads "Platanus" as a sponsor. The crowd is a vibrant, colorful backdrop. The fighters are stylized luchadores with iconic masks. The game is a pure Mexican arcade experience, not a hackathon simulation.

---

## 2. Camera & View

- **Vertical side-view**: The ring is a flat horizontal platform. We see the **front face** of the ring — the apron, the ropes, the turnbuckles, and the crowd behind it.
- **Ring dimensions**: Occupies ~70% of screen width, centered on the 800×600 canvas.
- **Movement**: Wrestlers move freely in all 4 directions (left/right/up/down) inside the ring.
- **Facing direction**: Only **left or right**. Determined by last horizontal joystick input. All attacks, jumps, and throws are strictly **left/right** — no vertical combat. This mirrors the M.U.S.C.L.E. NES constraint.

---

## 3. Controls

The arcade cabinet provides joystick + 6 action buttons per player. We use only 4 buttons to keep the arcade feel simple and tight.

| Arcade Input | Action |
|---|---|
| **Joystick (all directions)** | Move freely inside the ring. Left/right sets facing direction. |
| **Button 1** | Attack / Grab / Lift / Throw (context-sensitive) |
| **Button 2** | Duck |
| **Button 3** | Jump (hold to charge) |
| **Button 4** | Run / Dash (hold while moving) |

**Notes:**
- `START1` / `START2` are used for menu navigation, pausing, and confirming.
- `CABINET_KEYS` mapping in `game.js` must NOT be modified. All local testing shortcuts are appended to existing arrays.

---

## 4. Movement System

### 4.1 Walk & Run
- **Joystick alone**: Normal walk speed.
- **Button 4 + Joystick**: Run speed (2× walk speed). Running is required for the shoulder tackle.
- **Acceleration**: Walk and run speeds are instant (no acceleration curve). Arcade games feel better with immediate response.
- **Deceleration**: When joystick is released, speed drops to 0 instantly (no sliding). The ring is small; precision matters.

### 4.2 Facing
- Facing is determined by the last horizontal joystick input (left or right).
- If the joystick is in a neutral position, facing remains unchanged.
- Facing affects: attack direction, throw direction, punch knockback direction, and sprite flip (`scaleX`).

### 4.3 Rope Boundaries
- The ring is bounded by ropes on all four sides.
- Wrestlers **cannot leave the ring**.
- **Rope bounce physics**: When a wrestler hits the ropes, they bounce back with a **parabolic reflection** based on their current altitude. The higher they are, the more they arc backward.
- **Rope bending animation**: The ropes always bend slightly when hit, even if the jump is high enough that it looks like the wrestler is about to leave the ring. The bend is visual and proportional to the impact force.
- **Jump over ropes**: A basic jump is enough to clear the ropes. If a player jumps over the ropes, they land back inside the ring. The ropes are not a "wall" — they are a barrier that can be jumped over.
- **Bounce back**: If a player tries to jump over the ropes but doesn't clear them, they **bounce back** into the ring (prevents accidental ring-outs). The bounce follows the same parabolic reflection rule.

---

## 5. Jump System

### 5.1 Jump Charge
- **Button 3** triggers a jump. If held, a **jump charge bar** fills over **2 seconds** to max height.
- **No charge (tap)**: Basic jump. Low arc, height = ~2 wrestler heights.
- **Half charge (1 second)**: Medium jump. Height = ~3 wrestler heights.
- **Full charge (2 seconds)**: High jump. Height = ~4 wrestler heights. Never leaves the screen.
- **Release Button 3** to jump. The jump arc is determined by the charge level at release.
- The charge bar is visible above the player (small, unobtrusive).

### 5.2 Jump Arc
- Jump trajectory is a **parabolic arc** (standard gravity simulation).
- Horizontal velocity is inherited from the player's current movement speed.
- **Facing direction** determines the jump's horizontal direction if the player is moving.
- **No double jump.** Once airborne, the player is committed until landing.
- **Air control**: The joystick **DOES** alter the jump trajectory mid-air. Higher jumps grant more air control, allowing the player to better choose their landing spot. This makes charging a jump a strategic choice — you sacrifice time on the ground for better landing precision.
- **Shadow**: A circular shadow follows the player on the ground, showing the current landing spot. The shadow moves as the player adjusts their trajectory in the air.

### 5.3 Landing
- Landing on the mat = normal recovery.
- Landing on an opponent = **Body Slam** (see Attack System).
- Landing on ropes = **bounce back** into the ring.
- Landing outside the ring = **impossible** (boundaries prevent this).

### 5.4 Jump Over Opponent (Leapfrog)
- If a player jumps over a standing opponent, the opponent is **knocked down** for 2 seconds.
- This requires the jump arc to pass over the opponent's hitbox.
- The knockdown is triggered on the way up or on the way down, as long as the player passes over the opponent.

### 5.5 Top Rope Mechanics
- **To climb**: A player must jump and land exactly on top of a turnbuckle (the corner post). The turnbuckle is a small platform (e.g., 20×20 pixels).
- **Missed landing**: If the jump does not land precisely on the turnbuckle, the player **bounces back** into the ring (prevents accidental ring-outs).
- **On the top rope**: The player stands on the turnbuckle. They can **only jump** (Button 3). Button 1 does nothing.
- **Top rope jump**: Pressing Button 3 from the top rope triggers a **high jump**. A **shadow** appears on the ground below the player, showing the current landing spot.
- **Landing control**: While in the air from a top rope jump, the player can **move the landing spot left/right** with the joystick. This is the same air control system as regular jumps, but with even more control due to the higher altitude.
- **Landing on opponent**: A top rope jump landing on an opponent deals **massive damage** (40% health) and knocks the opponent down.
- **Top rope jump damage**: If the top rope jump lands on the mat (not on the opponent), it deals no damage to the opponent but makes the player briefly vulnerable on landing (0.2s recovery).

---

## 6. Attack System (Button 1)

Button 1 is **context-sensitive**. The action depends on the player's current state.

### 6.1 Standing Punch
- **Condition**: Standing still or walking. Button 1 = punch.
- **Damage**: 5% health.
- **Effect**: Brief stun (0.15s) on the opponent. Small **knockback** in the attacker's facing direction.
- **Knockback distance**: ~20 pixels (one body width).
- **Against ropes**: If the opponent is against the ropes, the knockback distance is reduced to ~5 pixels. The opponent stays within punching range, enabling a **3-punch combo**.
- **Combo**: 3 consecutive punches within 2 seconds → **knockdown** (opponent down for 2 seconds).
- **Punch recovery**: The attacker has a brief recovery (0.1s) after each punch. This prevents infinite punch spam.
- **Punch hitbox**: Extends forward from the player's facing direction, roughly 1.5× player width.

### 6.2 Shoulder Tackle (Running Attack)
- **Condition**: Running (Button 4 held + moving). Button 1 = shoulder tackle.
- **Damage**: 15% health.
- **Effect**: The player charges forward and collides with the opponent. Both players are briefly stunned (0.2s). The opponent is knocked back further than a punch.
- **Knockback**: ~40 pixels.
- **Against ropes**: Reduced to ~10 pixels.
- **Whiff**: If the tackle misses, the player has a longer recovery (0.4s).
- **Tackle hitbox**: Extends forward 2× player width.

### 6.3 Body Slam (Jumping Attack)
- **Condition**: Jumping (mid-air). Button 1 = body slam.
- **Effect**: The player immediately stops ascending and crashes straight down.
- **Damage**: 20% health to opponent if the player lands on them.
- **Landing**: If the player lands on the mat (not on the opponent), they have a brief recovery (0.3s).
- **Hitbox**: The player's body becomes the hitbox during the slam.
- **Visual**: The player sprite changes to a falling pose (slam pose) and crashes down.

### 6.4 Top Rope (No Attack)
- **Condition**: On top rope. Button 1 does nothing.
- The player can only jump (Button 3).

### 6.5 Grab, Lift, and Throw
- **Lift**: Only possible when the opponent is **knocked down on the mat**. Walk near the downed opponent and press **Button 1**.
- **Effect**: The attacker lifts the opponent over their shoulder (carrying state).
- **Carrying state**:
  - The attacker can **move left/right** while carrying.
  - The attacker **cannot jump** while carrying.
  - The attacker **cannot run** while carrying.
  - The attacker **can duck** while carrying (drops the opponent, no damage).
  - The carried opponent is rendered as their **Down** sprite, offset above the carrier's **Lift** sprite.
- **Throw**: While carrying, press **Button 1** to throw the opponent in the **facing direction**.
  - **Damage**: 20% health on impact.
  - **Knockback**: The thrown opponent travels ~100 pixels in the facing direction.
  - **Against ropes**: If thrown toward the ropes, the opponent bounces back into the ring (no damage from the bounce itself, just the throw impact).
  - **Outside ring prevention**: The opponent is always bounced back into the ring. No ring-outs.
- **Drop**: If the attacker is hit while carrying, they drop the opponent. The opponent takes no damage but is briefly stunned (0.2s).
- **Squirm free**: The carried opponent can **mash any button** to squirm free faster. Mashing reduces the carry duration by 50% (e.g., 1 second carry becomes 0.5 seconds if mashed).

### 6.6 Duck (Button 2)
- **Button 2** = Duck. The player crouches.
- **Hitbox**: The player's hitbox is reduced by 50% height.
- **Invulnerability**: Briefly invulnerable to **punches** (0.3s). Punches whiff over the crouching player.
- **Vulnerability**: Still vulnerable to **shoulder tackles**, **body slams**, and **throws**.
- **Cancel**: Duck can be canceled by releasing Button 2 or pressing Jump (Button 3).
- **Duck + Move**: The player can move left/right while ducking, but at 50% speed.
- **Visual**: The player sprite changes to the Duck pose.

---

## 7. Knockdown System

### 7.1 Knockdown Conditions
- **Health reaches 0**: The player is **KO'd**. The round ends immediately. No recovery.
- **All knockdowns are the same state**: Regardless of how the knockdown is achieved (3 consecutive punches, jump over, or any other mechanism), the knockdown state is identical — 2 seconds on the mat, then auto-recovery.
- **3 consecutive punches within 2 seconds**: Knockdown.
- **Jump over opponent (leapfrog)**: Knockdown.
- **Shoulder tackle**: Does NOT knock down. Only deals damage and knockback.
- **Body slam**: Does NOT knock down. Only deals damage if it lands on the opponent.
- **Throw**: Does NOT knock down. Only deals damage and knockback.

### 7.2 Knockdown State
- **Duration**: 2 seconds.
- **Visual**: The player lies on the mat (Down sprite). Small stars or a "zzz" effect appears above their head.
- **Recovery**: After 2 seconds, the player **automatically gets up** (auto-recovery). They stand up with the same health they had before the knockdown.
- **Vulnerability**: While down, the opponent can **lift** them (Button 1 near them).
- **Getting up animation**: The player rises from the Down sprite to the Walk sprite over 0.3s.
- **No manual recovery**: The downed player cannot mash buttons to get up faster. The recovery is fixed at 2 seconds.

### 7.3 KO (Round End)
- **Health reaches 0**: The player is KO'd.
- **Visual**: The player collapses to the mat. The screen flashes. The opponent does a victory pose.
- **Referee**: The referee (a small sprite or text) counts 1-2-3. The round ends.
- **No recovery**: KO is permanent for the round. The player cannot get up.

---

## 8. Health System

- **Health bar**: Continuous, 0–100%. No segments.
- **Damage constants** (tunable):
  - Punch = 5%
  - Shoulder tackle = 15%
  - Body slam (landing on opponent) = 20%
  - Throw (impact) = 20%
  - Top rope jump (landing on opponent) = 40%
- **Total health**: 100% (equivalent to 20 punches, or 5 slams, or 5 jump-overs).
- **Health display**: Health bar above each player's head (or in the HUD). Color-coded: green (100–50%), yellow (50–20%), red (20–0%).
- **No regeneration**: Health does not regenerate during the round.
- **No vulnerability states**: No "stun" or "dizzy" states beyond the brief punch stun. The health bar is the only indicator.

---

## 9. Win Condition & Timer

- **Timer**: 60 seconds per round.
- **KO**: If a player's health reaches 0, they are KO'd. The round ends immediately. The other player wins the round.
- **Time out**: If the timer reaches 0, the player with **more health** wins the round.
- **Tie (time out)**: If both players have the same health at time out, the round goes to **Sudden Death**: The next player to take damage loses the round.
- **Sudden Death**: Health is set to 20% for both players. The timer is removed. The next player to take damage is KO'd.
- **Match format**: Best of 3 rounds. First to win 2 rounds wins the match.
- **Round reset**: After each round, both players' health is reset to 100%. The timer resets to 60 seconds.

---

## 10. Rope Physics & Boundaries

- **Ropes**: The ring is bounded by 4 sets of ropes (top, bottom, left, right). The ropes are physical barriers.
- **Rope bounce physics**: When a player hits the ropes, they bounce back with a **parabolic reflection** based on their current altitude. The higher they are, the more they arc backward. The bounce trajectory is calculated as a reflection of the incoming velocity vector, modified by altitude.
- **Rope bending animation**: The ropes always bend slightly when hit, even if the jump is high enough that it looks like the wrestler is about to leave the ring. The bend is visual and proportional to the impact force.
- **Jump over ropes**: A basic jump is enough to clear the ropes. If a player jumps over the ropes, they land back inside the ring. The ropes are not a "wall" — they are a barrier that can be jumped over.
- **Bounce back**: If a player tries to jump over the ropes but doesn't clear them, they **bounce back** into the ring (prevents accidental ring-outs). The bounce follows the same parabolic reflection rule.
- **Throw outside**: If a player throws an opponent toward the ropes, the opponent bounces back into the ring.
- **No ring-outs**: Players cannot leave the ring. The ring is a closed arena.

---

## 11. Game Modes

### 11.1 Single Player (Tournament)
- **Structure**: 3 matches against AI opponents.
- **AI opponents**: 3 unique luchadores, each with a distinct style and signature move.
- **Match format**: Best of 3 rounds. 60 seconds per round.
- **Progression**: After each match, the player advances to the next opponent. If they lose, the tournament ends.
- **High score**: After winning the tournament, the player enters their initials (3 letters) and their score (total damage dealt - total damage taken) is saved to the leaderboard.

### 11.2 Two Player (Versus)
- **Structure**: Head-to-head. Player 1 vs Player 2.
- **Match format**: Best of 3 rounds. 60 seconds per round.
- **No co-op**: This is strictly competitive. No tag team or co-op mode.
- **High score**: After the match, the winner enters their initials. The score (total damage dealt) is saved to the leaderboard.

### 11.3 No Co-op
- There is no co-op mode. The game is strictly 1P vs AI or 2P vs each other.

---

## 12. AI Opponents

### 12.1 AI Decision Tree
- **Distance-based**: The AI evaluates the distance to the player and chooses an action.
  - **Close** (0–50 pixels): Punch, grab, or duck.
  - **Medium** (50–150 pixels): Charge (shoulder tackle) or jump.
  - **Far** (150+ pixels): Climb top rope or run toward player.
- **State-based**: The AI also considers the player's current state.
  - If player is down: Walk toward them and lift.
  - If player is jumping: Move away or duck.
  - If player is on top rope: Move to avoid the landing spot.
  - If player is carrying: Move toward the carrier and punch.

### 12.2 AI Personalities

| AI | Name | Style | Signature | Difficulty |
|---|---|---|---|---|
| 1 | **El Blue Demon** | Aggressive | Fast shoulder tackle spam. Charges constantly. Low defense. | Easy |
| 2 | **El Santo** | Defensive | Perfect duck timing. Waits for the player to attack, then counters. | Medium |
| 3 | **El Místico** | Aerial | Constantly climbs top rope. Top rope body slam. | Hard |

### 12.3 AI Behavior Details
- **Reaction time**: 100–200ms delay between seeing an action and responding. This makes the AI feel human, not robotic.
- **Recovery time**: After a knockdown, the AI gets up at a random time between 0.5–1.5 seconds. This prevents the player from predicting the AI's recovery.
- **Mistakes**: The AI occasionally makes mistakes (e.g., whiffing a punch, missing a jump). The mistake rate is 10–20% depending on difficulty.
- **Signature move frequency**: Each AI uses their signature move more often than other moves. El Blue Demon uses shoulder tackle 40% of the time. El Santo ducks 30% of the time. El Místico climbs top rope 30% of the time.
- **Health scaling**: AI health is the same as the player's (100%). The AI does not have more or less health.

---

## 13. Audio System

### 13.1 Sound Effects (Web Audio API)
All sounds are generated procedurally using the Web Audio API. No external audio files.

| Sound | Trigger | Description |
|---|---|---|
| **Punch** | Punch connects | Short noise burst (0.05s). |
| **Whiff** | Punch misses | Air swish (0.03s). |
| **Body slam** | Body slam lands | Low thud (0.15s). |
| **Rope bounce** | Player hits rope | Springy "boing" sound (0.1s). |
| **Top rope jump** | Player jumps from top rope | Wind whoosh (0.2s). |
| **Crowd cheer** | Round starts, KO, win | Rising tone (0.3s). |
| **KO bell** | KO | Loud gong (0.5s). |
| **Knockdown** | Player knocked down | Dull thud + short tone (0.1s). |
| **Count** | Referee counts pin | Short beep per count (0.05s). |
| **Select** | Menu navigation | High-pitched beep (0.05s). |
| **Confirm** | Menu confirm | Higher-pitched beep (0.08s). |

### 13.2 Music
- **Title screen**: Upbeat, fast-tempo 4-note loop. NES-style arpeggio.
- **Match**: Fast-paced, energetic loop. 8-bit chiptune style.
- **Victory**: Short, triumphant fanfare (3–5 seconds).
- **Music volume**: 0.15 (15% of master volume). SFX volume: 0.3 (30% of master volume).

---

## 14. Visual Style

### 14.1 Color Palette
- **Bright Mexican colors**: Hot pink, electric blue, gold, green, orange, purple.
- **Background**: Dark crowd (simple dots) with warm spotlights.
- **Ring**: Light gray mat with red, white, and blue ropes (classic lucha libre ring colors).
- **Apron**: Dark blue with "Platanus Hack 26" text in white.
- **HUD**: Black bars with bright text (yellow for P1, pink for P2).

### 14.2 Sprites (M.U.S.C.L.E. Style)
- **Resolution**: 24×24 pixels per character.
- **Style**: Chunky, muscular, minimal detail. Think plastic toy figures.
- **Characters**: Luchadores with iconic masks. The mask is the only unique part per character. The body is shared.
- **Sprite count**: 7 unique sprites per character (see Section 16 for details).
- **Mirroring**: Left-facing sprites are created by flipping right-facing sprites horizontally (`scaleX = -1`).
- **Animation**: Frame changes are instant (no tweening). Arcade games feel better with snappy transitions.

### 14.3 Particle Effects
- **Dust**: Small dust particles when a player lands from a jump or body slam.
- **Stars**: Small stars circling a knocked-down player's head.
- **Impact**: Small flash or particle burst when an attack connects.
- **Particles are cheap**: 4–6 small rectangles per effect. No complex physics.

---

## 15. Screen Flow

### 15.1 Title Screen
- **Background**: Animated ring with a shadow-boxing luchador silhouette.
- **Text**: "LUCHA DE CÓDIGO" in large, bold, Mexican-style font.
- **Subtitle**: "Platanus Hack 26 — CDMX".
- **Animation**: The title text pulses. The background luchador shadow-boxes.
- **Press START**: "PRESS START" blinks. Press START1 or START2 to proceed.
- **Music**: Title music loop plays.

### 15.2 Mode Select
- **Options**: "1 PLAYER" and "2 PLAYER".
- **Navigation**: Joystick up/down. Button 1 or START to confirm.
- **Selection highlight**: The selected option is highlighted in bright yellow.

### 15.3 Character Select
- **Options**: 2 luchador choices (P1 and P2, or P1 vs AI).
- **Display**: Each character is shown as a large sprite with their name below.
- **Navigation**: Joystick left/right to switch characters. Button 1 to confirm.
- **Selection**: P1 selects first, then P2 (or AI is auto-selected).

### 15.4 Match Screen
- **HUD**:
  - **Health bars**: Top left (P1) and top right (P2). Green → yellow → red.
  - **Timer**: Center top. 60 seconds. Flashes red when < 10 seconds.
  - **Round indicator**: "ROUND 1/3" below the timer.
  - **Player names**: Below health bars.
- **Ring**: Centered. Crowd behind. Ropes visible.
- **Referee**: Small sprite in the center of the ring (optional, for visual flair).
- **Match start**: Both players start at opposite corners. A "FIGHT!" text appears and fades.

### 15.5 Round Over
- **KO**: "KO!" text appears. The winner does a victory pose (arms up). The loser lies on the mat.
- **Time out**: "TIME!" text appears. The winner is declared based on health.
- **Sudden Death**: "SUDDEN DEATH!" text appears. Both players reset to 20% health.
- **Transition**: 2-second pause, then next round or match over.

### 15.6 Match Over
- **Winner**: "WINNER" text + winner's name. Winner does victory pose.
- **Score**: Total damage dealt / taken displayed.
- **High score**: If the score is high enough, the player enters their initials (3 letters).
- **Options**: "PLAY AGAIN" or "QUIT".

### 15.7 High Score / Leaderboard
- **Display**: Top 5 scores with initials and scores.
- **Navigation**: Press START to return to title screen.
- **Storage**: Scores are saved using `window.platanusArcadeStorage` (or localStorage fallback).

---

## 16. Sprite System (Deferred)

The sprite system will be designed after all other code is written, to determine how much space remains within the 50KB budget.

### 16.1 Current Estimate
- **Target sprite budget**: 6–10 KB.
- **Sprite resolution**: 24×24 pixels.
- **Sprite count**: 7 unique sprites per character (see below).
- **Total unique sprites**: 14 (7 per character × 2 characters).
- **Mirroring**: Left-facing sprites are created by flipping right-facing sprites horizontally.

### 16.2 Proposed Sprite Kit (To Be Evaluated)

| Sprite | Used For |
|---|---|
| **Walk** | Standing, walking, running, shoulder tackle |
| **Duck** | Crouching, body slam landing |
| **Punch** | Standing attack |
| **Hit** | Recoiling from damage |
| **Down** | Knocked down, being carried |
| **Lift** | Carrying opponent over shoulder |
| **Jump** | Mid-air, top rope stance, knockdown recovery |

### 16.3 Space-Saving Options
- **Option A: Full Frames**: Store each pose as a complete 24×24 sprite. Simple, but space-heavy (~3–4KB per character).
- **Option B: Part Assembly (Kit)**: Store body parts (torso, head, arms) separately and assemble them at runtime. Complex, but saves ~70% space (~1KB per character).
- **Decision**: Will be made after all other code is written and the remaining space is known.

---

## 17. Size Budget Estimate

| Component | Estimated KB | Notes |
|---|---|---|
| Core game loop + physics | ~8 KB | Main update loop, collision detection, movement, jumping. |
| State machine + controls | ~5 KB | Player states, control mapping, input handling. |
| Ring rendering + crowd | ~3 KB | Procedural ring, ropes, crowd dots. |
| Audio system | ~4 KB | Web Audio API, sound generation, music loops. |
| Screens (menu, HUD, results) | ~6 KB | Title, mode select, character select, match, round over, match over. |
| AI logic | ~3 KB | 3 AI opponents, decision tree, behavior. |
| **Sprites** (target budget) | ~6–10 KB | CSEF strings, sprite rendering, assembly. |
| **Total** | ~35–39 KB | |
| **Headroom** | ~11–15 KB | Buffer for unexpected code, extra sprites, or effects. |

**Note:** These are rough estimates, not hard constraints. The actual code size will be determined after writing and minification. The sprite system will be designed after all other code is written, to see how much space remains. If the game is under budget, we can add more sprites, effects, or polish. If it's over, we will optimize or cut features.

---

## 18. Open Questions & TODOs

- **Sprite system**: Decide between full-frame vs. part-assembly after code is written.
- **AI tuning**: Balance AI difficulty through playtesting. Adjust reaction time, mistake rate, and signature move frequency.
- **Particle effects**: Finalize particle count and style (dust, stars, impact flashes).
- **Music**: Finalize the 4-note and 8-bit loops. Keep them simple and short to save space.
- **Referee**: Decide if the referee is a sprite or just text. A sprite adds charm but costs space.

---

## 19. Approval

This design is approved for implementation.

**Next step:** Write the implementation plan (invoke writing-plans skill).
