/* ============================================================
   FORTE QUEST — Theme-Based Pixel Character Avatars
   Crisp 28x28 Retro Pixel Art SVGs with animated speaking states,
   eye blinking, and emotion reactions (happy smile & skeptical frown).
   ============================================================ */

function rect(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" />`;
}

function getPixelAvatarSvg(caseId) {
  const cid = Number(caseId) || 1;
  const SKIN_BASE = '#FFDBAC';
  const SKIN_SHADOW = '#E0B589';
  const parts = [];

  if (cid === 1) {
    // Case 1: Айгерим (Госзакупки) — Businesswoman in Forte navy blazer, glasses, pearl earrings
    const HAIR = '#2D1B18';
    const HAIR_LIGHT = '#4A352F';
    const SUIT = '#072146';
    const SHIRT = '#FFFFFF';
    const GLASSES = '#61CFFF';

    // Hair Back
    parts.push(rect(6, 4, 16, 14, HAIR));
    parts.push(rect(5, 7, 18, 12, HAIR));

    // Face base & Neck
    parts.push(rect(8, 7, 12, 11, SKIN_BASE));
    parts.push(rect(9, 18, 10, 2, SKIN_SHADOW));
    parts.push(rect(11, 18, 6, 3, SKIN_BASE));

    // Hair front/bangs
    parts.push(rect(7, 3, 14, 5, HAIR));
    parts.push(rect(8, 4, 12, 2, HAIR_LIGHT));
    parts.push(rect(6, 6, 3, 9, HAIR));
    parts.push(rect(19, 6, 3, 9, HAIR));

    // Pearl Earrings
    parts.push(rect(6, 14, 2, 2, '#FFFFFF'));
    parts.push(rect(20, 14, 2, 2, '#FFFFFF'));

    // Eyes
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#1E293B")}${rect(16, 11, 2, 2, "#1E293B")}</g>`);

    // Glasses Frame
    parts.push(`<g class="pixel-glasses">${rect(9, 10, 4, 1, GLASSES)}${rect(9, 13, 4, 1, GLASSES)}${rect(9, 10, 1, 4, GLASSES)}${rect(12, 10, 1, 4, GLASSES)}${rect(13, 11, 2, 1, GLASSES)}${rect(15, 10, 4, 1, GLASSES)}${rect(15, 13, 4, 1, GLASSES)}${rect(15, 10, 1, 4, GLASSES)}${rect(18, 10, 1, 4, GLASSES)}</g>`);

    // Nose
    parts.push(rect(13, 13, 2, 1, SKIN_SHADOW));

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, "#C2410C")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#450A0A")}${rect(13, 16, 2, 1, "#F43F5E")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, "#C2410C")}${rect(12, 16, 4, 1, "#C2410C")}${rect(16, 15, 1, 1, "#C2410C")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#C2410C")}${rect(12, 15, 4, 1, "#C2410C")}${rect(16, 16, 1, 1, "#C2410C")}</g>`);

    // Clothes: Navy Blazer + Sky blue blouse + Forte ID badge
    parts.push(rect(4, 21, 20, 7, SUIT));
    parts.push(rect(11, 21, 6, 5, SHIRT));
    parts.push(rect(12, 21, 4, 7, '#61CFFF'));
    parts.push(rect(7, 23, 2, 3, '#F59E0B'));
    parts.push(rect(10, 21, 2, 7, '#0E3A75'));
    parts.push(rect(16, 21, 2, 7, '#0E3A75'));

  } else if (cid === 2) {
    // Case 2: Бауржан (Самрук-Казына / Строитель) — Hard hat, mustache, safety vest
    const HELMET = '#F59E0B';
    const HELMET_DARK = '#D97706';
    const VEST = '#EA580C';
    const VEST_REFLECT = '#FACC15';
    const BEARD = '#374151';

    parts.push(rect(8, 8, 12, 10, SKIN_BASE));
    parts.push(rect(11, 18, 6, 3, SKIN_SHADOW));

    // Construction Hardhat
    parts.push(rect(7, 3, 14, 5, HELMET));
    parts.push(rect(9, 4, 10, 2, '#FBBF24'));
    parts.push(rect(5, 7, 18, 3, HELMET_DARK));
    parts.push(rect(12, 2, 4, 2, HELMET_DARK));

    // Ears & Hair
    parts.push(rect(6, 10, 2, 3, SKIN_BASE));
    parts.push(rect(20, 10, 2, 3, SKIN_BASE));
    parts.push(rect(7, 9, 2, 3, BEARD));
    parts.push(rect(19, 9, 2, 3, BEARD));

    // Thick Eyebrows & Eyes
    parts.push(rect(9, 9, 4, 1, BEARD));
    parts.push(rect(15, 9, 4, 1, BEARD));
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#111827")}${rect(16, 11, 2, 2, "#111827")}</g>`);

    // Nose
    parts.push(rect(13, 12, 2, 2, SKIN_SHADOW));

    // Engineer Mustache
    parts.push(`<g class="pixel-mustache">${rect(10, 14, 8, 2, BEARD)}${rect(11, 13, 6, 1, BEARD)}</g>`);

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 16, 4, 1, "#9A3412")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#431407")}${rect(13, 16, 2, 1, "#F87171")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, "#9A3412")}${rect(12, 16, 4, 1, "#9A3412")}${rect(16, 15, 1, 1, "#9A3412")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#9A3412")}${rect(12, 15, 4, 1, "#9A3412")}${rect(16, 16, 1, 1, "#9A3412")}</g>`);

    // High-vis Orange Safety Vest
    parts.push(rect(4, 21, 20, 7, '#1E3A8A'));
    parts.push(rect(6, 21, 16, 7, VEST));
    parts.push(rect(8, 21, 2, 7, VEST_REFLECT));
    parts.push(rect(18, 21, 2, 7, VEST_REFLECT));
    parts.push(rect(6, 25, 16, 2, VEST_REFLECT));

  } else if (cid === 3) {
    // Case 3: Ерлан (ИП / Торговля) — Young merchant, casual polo shirt, friendly
    const HAIR = '#18181B';
    const POLO = '#0D9488';

    parts.push(rect(7, 3, 14, 6, HAIR));
    parts.push(rect(6, 6, 3, 5, HAIR));
    parts.push(rect(19, 6, 3, 5, HAIR));
    parts.push(rect(8, 4, 8, 2, '#3F3F46'));

    parts.push(rect(8, 7, 12, 11, SKIN_BASE));
    parts.push(rect(11, 18, 6, 3, SKIN_BASE));

    // Trim beard
    parts.push(rect(8, 14, 1, 3, '#52525B'));
    parts.push(rect(19, 14, 1, 3, '#52525B'));
    parts.push(rect(9, 17, 10, 1, '#52525B'));

    // Eyes
    parts.push(rect(9, 9, 3, 1, '#27272A'));
    parts.push(rect(16, 9, 3, 1, '#27272A'));
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#18181B")}${rect(16, 11, 2, 2, "#18181B")}</g>`);

    parts.push(rect(13, 12, 2, 1, SKIN_SHADOW));

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, "#C2410C")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 14, 4, 3, "#450A0A")}${rect(13, 15, 2, 1, "#FB7185")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 14, 1, 1, "#C2410C")}${rect(12, 15, 4, 2, "#C2410C")}${rect(16, 14, 1, 1, "#C2410C")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#C2410C")}${rect(12, 15, 4, 1, "#C2410C")}${rect(16, 16, 1, 1, "#C2410C")}</g>`);

    // Turquoise Polo
    parts.push(rect(4, 21, 20, 7, POLO));
    parts.push(rect(12, 21, 4, 4, '#14B8A6'));
    parts.push(rect(13, 21, 2, 2, SKIN_BASE));

  } else if (cid === 4) {
    // Case 4: Владимир Ильич (АО КазСтрой / Финдиректор) — Executive, silver hair, suit & blue tie
    const HAIR = '#E2E8F0';
    const HAIR_SHADOW = '#94A3B8';
    const SUIT = '#1E293B';
    const TIE = '#61CFFF';

    parts.push(rect(7, 3, 14, 6, HAIR));
    parts.push(rect(6, 6, 3, 7, HAIR));
    parts.push(rect(19, 6, 3, 7, HAIR));
    parts.push(rect(10, 4, 8, 2, '#FFFFFF'));
    parts.push(rect(7, 8, 2, 4, HAIR_SHADOW));
    parts.push(rect(19, 8, 2, 4, HAIR_SHADOW));

    parts.push(rect(8, 7, 12, 11, SKIN_BASE));
    parts.push(rect(11, 18, 6, 3, SKIN_SHADOW));

    // Mature brow lines
    parts.push(rect(9, 8, 4, 1, HAIR_SHADOW));
    parts.push(rect(15, 8, 4, 1, HAIR_SHADOW));
    parts.push(rect(11, 10, 1, 1, SKIN_SHADOW));
    parts.push(rect(16, 10, 1, 1, SKIN_SHADOW));

    // Eyes
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#0F172A")}${rect(16, 11, 2, 2, "#0F172A")}</g>`);

    parts.push(rect(13, 12, 2, 2, SKIN_SHADOW));

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, "#B45309")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#450A0A")}${rect(13, 16, 2, 1, "#F87171")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, "#B45309")}${rect(12, 16, 4, 1, "#B45309")}${rect(16, 15, 1, 1, "#B45309")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#B45309")}${rect(12, 15, 4, 1, "#B45309")}${rect(16, 16, 1, 1, "#B45309")}</g>`);

    // Charcoal Suit + Sky Blue Tie
    parts.push(rect(4, 21, 20, 7, SUIT));
    parts.push(rect(11, 21, 6, 7, '#FFFFFF'));
    parts.push(rect(13, 21, 2, 7, TIE));
    parts.push(rect(9, 21, 3, 7, '#0F172A'));
    parts.push(rect(16, 21, 3, 7, '#0F172A'));
    parts.push(rect(6, 23, 2, 1, '#FFFFFF'));

  } else if (cid === 5) {
    // Case 5: Alex / John (Нерезидент) — Expat tech rep, blonde hair, blue earpiece, modern blazer
    const HAIR = '#D97706';
    const HAIR_LIGHT = '#FDE68A';
    const BLAZER = '#1E3A8A';
    const TECH_BLUE = '#38BDF8';

    parts.push(rect(7, 3, 14, 5, HAIR));
    parts.push(rect(8, 3, 10, 2, HAIR_LIGHT));
    parts.push(rect(6, 6, 3, 6, HAIR));
    parts.push(rect(19, 6, 3, 6, HAIR));

    parts.push(rect(8, 7, 12, 11, '#FED7AA'));
    parts.push(rect(11, 18, 6, 3, '#FDBA74'));

    // Tech Bluetooth Earpiece
    parts.push(`<g class="pixel-earpiece">${rect(20, 11, 2, 4, TECH_BLUE)}${rect(21, 12, 1, 2, "#FFFFFF")}</g>`);

    // Designer Glasses
    parts.push(`<g class="pixel-glasses">${rect(9, 10, 4, 1, "#1E293B")}${rect(9, 13, 4, 1, "#1E293B")}${rect(9, 10, 1, 4, "#1E293B")}${rect(12, 10, 1, 4, "#1E293B")}${rect(13, 11, 2, 1, "#1E293B")}${rect(15, 10, 4, 1, "#1E293B")}${rect(15, 13, 4, 1, "#1E293B")}${rect(15, 10, 1, 4, "#1E293B")}${rect(18, 10, 1, 4, "#1E293B")}</g>`);

    // Eyes
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#0284C7")}${rect(16, 11, 2, 2, "#0284C7")}</g>`);

    parts.push(rect(13, 13, 2, 1, '#FDBA74'));

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, "#EA580C")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#450A0A")}${rect(13, 16, 2, 1, "#FB7185")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, "#EA580C")}${rect(12, 16, 4, 1, "#EA580C")}${rect(16, 15, 1, 1, "#EA580C")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#EA580C")}${rect(12, 15, 4, 1, "#EA580C")}${rect(16, 16, 1, 1, "#EA580C")}</g>`);

    // Blazer + Turtleneck
    parts.push(rect(4, 21, 20, 7, BLAZER));
    parts.push(rect(11, 21, 6, 7, '#334155'));
    parts.push(rect(10, 21, 2, 7, '#172554'));
    parts.push(rect(16, 21, 2, 7, '#172554'));

  } else if (cid === 6) {
    // Case 6: Данияр (Forte-Партнёр / VIP) — Black suit, gold Forte pin, elite styling
    const HAIR = '#09090B';
    const TUX = '#0F172A';
    const LAPEL = '#020617';
    const GOLD = '#F59E0B';

    parts.push(rect(7, 3, 14, 5, HAIR));
    parts.push(rect(6, 6, 3, 6, HAIR));
    parts.push(rect(19, 6, 3, 6, HAIR));
    parts.push(rect(9, 4, 6, 2, '#27272A'));

    parts.push(rect(8, 7, 12, 11, SKIN_BASE));
    parts.push(rect(11, 18, 6, 3, SKIN_SHADOW));

    // Eyes
    parts.push(rect(9, 9, 3, 1, '#18181B'));
    parts.push(rect(16, 9, 3, 1, '#18181B'));
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#18181B")}${rect(16, 11, 2, 2, "#18181B")}</g>`);

    parts.push(rect(13, 12, 2, 1, SKIN_SHADOW));

    // Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, "#B45309")}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#450A0A")}${rect(13, 16, 2, 1, "#F43F5E")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, "#B45309")}${rect(12, 16, 4, 1, "#B45309")}${rect(16, 15, 1, 1, "#B45309")}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, "#B45309")}${rect(12, 15, 4, 1, "#B45309")}${rect(16, 16, 1, 1, "#B45309")}</g>`);

    // Luxury Black Tuxedo + Silk Collar + Golden Forte Badge
    parts.push(rect(4, 21, 20, 7, TUX));
    parts.push(rect(11, 21, 6, 7, '#FFFFFF'));
    parts.push(rect(13, 21, 2, 3, '#020617'));
    parts.push(rect(9, 21, 2, 7, LAPEL));
    parts.push(rect(17, 21, 2, 7, LAPEL));
    parts.push(rect(7, 23, 2, 2, GOLD));
    parts.push(rect(18, 22, 2, 1, '#61CFFF'));

  } else {
    // Case 7 & Default: Айгуль (Электронные закупки / Онлайн-выпуск) — Modern procurement specialist
    const HAIR = '#1E1B18';
    const HAIR_LIGHT = '#3E2F28';
    const TEAL_SUIT = '#0F766E';
    const TEAL_ACCENT = '#0D9488';
    const CYAN = '#0EA5E9';
    const LIP = '#E11D48';

    // Top Bun & Hairclip
    parts.push(rect(11, 1, 6, 3, HAIR));
    parts.push(rect(12, 2, 4, 1, HAIR_LIGHT));
    parts.push(rect(16, 2, 2, 2, '#F59E0B'));

    // Hair Back & Bangs
    parts.push(rect(6, 4, 16, 14, HAIR));
    parts.push(rect(5, 7, 18, 11, HAIR));
    parts.push(rect(7, 3, 14, 4, HAIR));
    parts.push(rect(8, 4, 12, 2, HAIR_LIGHT));
    parts.push(rect(6, 6, 3, 9, HAIR));
    parts.push(rect(19, 6, 3, 9, HAIR));

    // Face & Neck
    parts.push(rect(8, 7, 12, 11, SKIN_BASE));
    parts.push(rect(9, 18, 10, 2, SKIN_SHADOW));
    parts.push(rect(11, 18, 6, 3, SKIN_BASE));

    // Earrings
    parts.push(rect(6, 14, 2, 2, '#38BDF8'));
    parts.push(rect(20, 14, 2, 2, '#38BDF8'));

    // Eyes
    parts.push(`<g class="pixel-eyes">${rect(10, 11, 2, 2, "#0F172A")}${rect(16, 11, 2, 2, "#0F172A")}</g>`);

    // Modern Smart Glasses
    parts.push(`<g class="pixel-glasses">${rect(9, 10, 4, 1, CYAN)}${rect(9, 13, 4, 1, CYAN)}${rect(9, 10, 1, 4, CYAN)}${rect(12, 10, 1, 4, CYAN)}${rect(13, 11, 2, 1, CYAN)}${rect(15, 10, 4, 1, CYAN)}${rect(15, 13, 4, 1, CYAN)}${rect(15, 10, 1, 4, CYAN)}${rect(18, 10, 1, 4, CYAN)}</g>`);

    // Nose
    parts.push(rect(13, 13, 2, 1, SKIN_SHADOW));

    // Expressive Mouths
    parts.push(`<g class="mouth-closed">${rect(12, 15, 4, 1, LIP)}</g>`);
    parts.push(`<g class="mouth-open">${rect(12, 15, 4, 3, "#450A0A")}${rect(13, 16, 2, 1, "#FB7185")}</g>`);
    parts.push(`<g class="mouth-happy">${rect(11, 15, 1, 1, LIP)}${rect(12, 16, 4, 1, LIP)}${rect(16, 15, 1, 1, LIP)}</g>`);
    parts.push(`<g class="mouth-skeptical">${rect(11, 16, 1, 1, LIP)}${rect(12, 15, 4, 1, LIP)}${rect(16, 16, 1, 1, LIP)}</g>`);

    // Modern Professional Teal Suit + Mint Blouse + Forte Digital ID
    parts.push(rect(4, 21, 20, 7, TEAL_SUIT));
    parts.push(rect(11, 21, 6, 7, '#F0FDFA'));
    parts.push(rect(12, 22, 4, 6, '#14B8A6'));
    parts.push(rect(9, 21, 2, 7, TEAL_ACCENT));
    parts.push(rect(17, 21, 2, 7, TEAL_ACCENT));
    parts.push(rect(7, 23, 2, 3, '#F59E0B'));
    parts.push(rect(18, 22, 2, 1, '#38BDF8'));
  }

  return `<svg viewBox="0 0 28 28" class="pixel-avatar-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Клиент ${cid}">\n${parts.join('')}\n</svg>`;
}
