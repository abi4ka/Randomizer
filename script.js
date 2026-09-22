/**
 * Randomizer — Fast, Flexible & Animated Client-Side Engine
 * Synchronization with GitHub Graphite Design Language & Time-Calculator Layout
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    let activeTab = 'numbers'; // 'numbers' | 'list' | 'colors' | 'dice'
    let isAnimated = true;
    let isSoundEnabled = true;
    let isRolling = false;
    let totalRollsCount = 0;
    let historyList = [];

    // Mode-specific state
    let activeColorMode = 'single'; // 'single' | 'palette'
    let activePaletteType = 'random';
    let activeDiceSubmode = 'dice'; // 'dice' | 'coin'
    let activeDiceSides = 6;
    let currentColorData = null;

    // Storage Keys
    const STORAGE_KEY_ANIMATED = 'randomizer_animated';
    const STORAGE_KEY_SOUND = 'randomizer_sound';
    const STORAGE_KEY_HISTORY = 'randomizer_history';
    const STORAGE_KEY_TOTAL_ROLLS = 'randomizer_total_rolls';

    // --- DOM Elements ---
    // Top Navbar
    const toggleAnimated = document.getElementById('toggle-animated');
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const iconSoundOn = document.getElementById('icon-sound-on');
    const iconSoundOff = document.getElementById('icon-sound-off');
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');
    const statCount = document.getElementById('stat-count');
    const statTotalRolls = document.getElementById('stat-total-rolls');
    const statActiveMode = document.getElementById('stat-active-mode');
    const animIndicatorTag = document.getElementById('anim-indicator-tag');
    const toastContainer = document.getElementById('toast-container');
    const glowOrb1 = document.getElementById('glow-orb-1');
    const glowOrb2 = document.getElementById('glow-orb-2');

    // Tabs
    const tabButtons = {
        numbers: document.getElementById('tab-numbers'),
        list: document.getElementById('tab-list'),
        colors: document.getElementById('tab-colors'),
        dice: document.getElementById('tab-dice')
    };

    const modeViews = {
        numbers: document.getElementById('mode-numbers-view'),
        list: document.getElementById('mode-list-view'),
        colors: document.getElementById('mode-colors-view'),
        dice: document.getElementById('mode-dice-view')
    };

    // Mode 1: Numbers DOM
    const numMin = document.getElementById('num-min');
    const numMax = document.getElementById('num-max');
    const numCount = document.getElementById('num-count');
    const checkUnique = document.getElementById('check-unique');
    const checkDecimals = document.getElementById('check-decimals');
    const numSort = document.getElementById('num-sort');

    // Mode 2: List DOM
    const listInput = document.getElementById('list-input');
    const listItemsCount = document.getElementById('list-items-count');
    const listPickCount = document.getElementById('list-pick-count');
    const checkListRemove = document.getElementById('check-list-remove');
    const btnListShuffle = document.getElementById('btn-list-shuffle');
    const btnListClear = document.getElementById('btn-list-clear');

    // Mode 3: Colors DOM
    const btnColorSingle = document.getElementById('btn-color-single');
    const btnColorPalette = document.getElementById('btn-color-palette');
    const paletteTypeWrapper = document.getElementById('palette-type-wrapper');
    const selectPaletteType = document.getElementById('select-palette-type');
    const colorPreviewContainer = document.getElementById('color-preview-container');

    // Mode 4: Dice & Coins DOM
    const btnSubmodeDice = document.getElementById('btn-submode-dice');
    const btnSubmodeCoin = document.getElementById('btn-submode-coin');
    const diceControlsSection = document.getElementById('dice-controls-section');
    const coinControlsSection = document.getElementById('coin-controls-section');
    const diceCount = document.getElementById('dice-count');
    const diceModifier = document.getElementById('dice-modifier');

    // Live Result Stage DOM
    const primaryResultText = document.getElementById('primary-result-text');
    const resultBreakdown = document.getElementById('result-breakdown');
    const btnCopyResult = document.getElementById('btn-copy-result');
    const copyBtnLabel = document.getElementById('copy-btn-label');
    const btnRoll = document.getElementById('btn-roll');
    const btnRollText = document.getElementById('btn-roll-text');

    // Right Sidebar (History) DOM
    const historyEmpty = document.getElementById('history-empty');
    const historyItemsList = document.getElementById('history-items-list');
    const btnClearHistory = document.getElementById('btn-clear-history');
    const btnCopyHistory = document.getElementById('btn-copy-history');
    const copySummaryText = document.getElementById('copy-summary-text');

    // Current latest raw result for easy copying
    let latestResultRaw = '';

    // =========================================================================
    // Web Audio Synthesizer (Zero External Audio Files)
    // =========================================================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTickSound() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520 + Math.random() * 120, ctx.currentTime);
            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.045);
        } catch (e) {}
    }

    function playSuccessSound() {
        if (!isSoundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            
            // Chord: note 1
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now); // D5
            gain1.gain.setValueAtTime(0.06, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.25);

            // Chord: note 2
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, now + 0.06); // A5
            gain2.gain.setValueAtTime(0.08, now + 0.06);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.06);
            osc2.stop(now + 0.35);
        } catch (e) {}
    }

    // =========================================================================
    // True Cryptographic Random Utilities
    // =========================================================================
    function cryptoRandomFloat() {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }

    function cryptoRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }
        return Math.floor(cryptoRandomFloat() * (max - min + 1)) + min;
    }

    function cryptoShuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(cryptoRandomFloat() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // =========================================================================
    // Mode Switching
    // =========================================================================
    function setActiveTab(tabKey) {
        if (!tabButtons[tabKey] || !modeViews[tabKey]) return;
        activeTab = tabKey;

        Object.keys(tabButtons).forEach(key => {
            const btn = tabButtons[key];
            const isTarget = key === tabKey;
            btn.classList.toggle('active', isTarget);
            btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        Object.keys(modeViews).forEach(key => {
            modeViews[key].classList.toggle('hidden', key !== tabKey);
        });

        const modeNames = {
            numbers: 'Numbers',
            list: 'Phrases & List',
            colors: 'Colors',
            dice: 'Dice & Coins'
        };
        statActiveMode.textContent = modeNames[tabKey] || 'Numbers';

        // Re-render color preview if switching to colors
        if (tabKey === 'colors' && !currentColorData) {
            generateColorResult(false);
        }
    }

    Object.keys(tabButtons).forEach(key => {
        tabButtons[key].addEventListener('click', () => setActiveTab(key));
    });

    // =========================================================================
    // Mode 1: Numbers Logic (Clean: Min n to Max m)
    // =========================================================================
    function getNumbersConfig() {
        let min = parseFloat(numMin.value);
        let max = parseFloat(numMax.value);
        if (isNaN(min)) min = 1;
        if (isNaN(max)) max = 10;
        if (min > max) [min, max] = [max, min];

        let count = parseInt(numCount.value, 10);
        if (isNaN(count) || count < 1) count = 1;
        if (count > 100) count = 100;

        const unique = checkUnique.checked;
        const isDecimal = checkDecimals.checked;
        const sortType = numSort.value;

        return { min, max, count, unique, isDecimal, sortType };
    }

    function generateNumbersResult() {
        const { min, max, count, unique, isDecimal, sortType } = getNumbersConfig();

        if (isDecimal) {
            const results = [];
            const seen = new Set();
            let attempts = 0;
            while (results.length < count && attempts < count * 100) {
                attempts++;
                const formatted = (min + cryptoRandomFloat() * (max - min)).toFixed(2);
                if (unique && seen.has(formatted)) continue;
                seen.add(formatted);
                results.push(parseFloat(formatted));
            }
            while (results.length < count) {
                results.push(parseFloat((min + cryptoRandomFloat() * (max - min)).toFixed(2)));
            }

            if (sortType === 'asc') results.sort((a, b) => a - b);
            if (sortType === 'desc') results.sort((a, b) => b - a);

            const displayStr = results.map(n => n.toFixed(2)).join(', ');
            return {
                primary: displayStr,
                raw: displayStr,
                breakdown: results.length > 1 ? `Count: ${results.length} • Min: ${Math.min(...results).toFixed(2)} • Max: ${Math.max(...results).toFixed(2)} • Sum: ${results.reduce((a, b) => a + b, 0).toFixed(2)}` : null,
                detailTitle: `Range: ${min} to ${max} (Decimals)`,
                mode: 'numbers'
            };
        }

        const intMin = Math.round(min);
        const intMax = Math.round(max);
        const possibleCount = intMax - intMin + 1;

        if (unique && count > possibleCount) {
            showToast(`Range only contains ${possibleCount} unique integers!`);
            return null;
        }

        let results = [];
        if (unique) {
            const pool = [];
            for (let i = intMin; i <= intMax; i++) pool.push(i);
            const shuffled = cryptoShuffle(pool);
            results = shuffled.slice(0, count);
        } else {
            for (let i = 0; i < count; i++) {
                results.push(cryptoRandomInt(intMin, intMax));
            }
        }

        if (sortType === 'asc') results.sort((a, b) => a - b);
        if (sortType === 'desc') results.sort((a, b) => b - a);

        const displayStr = results.join(', ');
        return {
            primary: results.length === 1 ? String(results[0]) : results.join(', '),
            raw: displayStr,
            breakdown: results.length > 1 ? `Count: ${results.length} • Min: ${Math.min(...results)} • Max: ${Math.max(...results)} • Sum: ${results.reduce((a, b) => a + b, 0)}` : null,
            detailTitle: `Range: ${intMin} – ${intMax}`,
            mode: 'numbers'
        };
    }

    // =========================================================================
    // Mode 2: List / Phrases Logic (Clean without sample clutter)
    // =========================================================================
    function getListItems() {
        const text = listInput.value;
        if (!text.trim()) return [];

        let items = [];
        if (text.includes('\n')) {
            items = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        } else if (text.includes(',')) {
            items = text.split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
        } else {
            items = [text.trim()];
        }
        return items;
    }

    function updateListCounter() {
        const items = getListItems();
        listItemsCount.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
    }

    listInput.addEventListener('input', updateListCounter);

    btnListShuffle.addEventListener('click', () => {
        const items = getListItems();
        if (items.length <= 1) {
            showToast('Enter at least 2 items to shuffle');
            return;
        }
        const shuffled = cryptoShuffle(items);
        listInput.value = shuffled.join('\n');
        showToast('List shuffled randomly');
    });

    btnListClear.addEventListener('click', () => {
        listInput.value = '';
        updateListCounter();
        showToast('List cleared');
    });

    function generateListResult(isFinal = true) {
        const items = getListItems();
        if (items.length === 0) {
            if (isFinal) showToast('Please enter at least 1 item in the list!');
            return null;
        }

        let pickCount = parseInt(listPickCount.value, 10);
        if (isNaN(pickCount) || pickCount < 1) pickCount = 1;

        if (pickCount > items.length) {
            pickCount = items.length;
        }

        const shuffled = cryptoShuffle(items);
        const picked = shuffled.slice(0, pickCount);

        // If remove chosen is enabled and this is the final resolution, remove picked items from listInput
        if (isFinal && checkListRemove.checked) {
            const remaining = items.filter(item => !picked.includes(item));
            listInput.value = remaining.join('\n');
            updateListCounter();
        }

        const primary = picked.length === 1 ? picked[0] : picked.join(' • ');
        return {
            primary: primary,
            raw: picked.join(', '),
            breakdown: picked.length > 1 ? `Picked ${picked.length} of ${items.length} items` : `Picked 1 of ${items.length} items`,
            detailTitle: 'List Pick',
            mode: 'list'
        };
    }

    // =========================================================================
    // Mode 3: Color Studio Logic
    // =========================================================================
    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function createColorObject(h, s, l) {
        const [r, g, b] = hslToRgb(h, s, l);
        const hex = rgbToHex(r, g, b);
        const luminance = getLuminance(r, g, b);
        const textColor = luminance > 0.4 ? '#0d1117' : '#ffffff';
        return {
            hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`,
            textColor,
            r, g, b, h, s, l
        };
    }

    function generateRandomColor() {
        const h = cryptoRandomFloat() * 360;
        const s = 65 + cryptoRandomFloat() * 35;
        const l = 40 + cryptoRandomFloat() * 30;
        return createColorObject(h, s, l);
    }

    function generateColorPalette(type) {
        const baseH = cryptoRandomFloat() * 360;
        const colors = [];

        if (type === 'pastel') {
            for (let i = 0; i < 5; i++) {
                const h = (baseH + i * 45) % 360;
                colors.push(createColorObject(h, 60 + cryptoRandomFloat() * 15, 75 + cryptoRandomFloat() * 10));
            }
        } else if (type === 'monochrome') {
            for (let i = 0; i < 5; i++) {
                const l = 20 + i * 15;
                colors.push(createColorObject(baseH, 70, l));
            }
        } else if (type === 'complementary') {
            const compH = (baseH + 180) % 360;
            colors.push(createColorObject(baseH, 80, 50));
            colors.push(createColorObject(baseH, 60, 65));
            colors.push(createColorObject((baseH + 30) % 360, 70, 55));
            colors.push(createColorObject(compH, 80, 50));
            colors.push(createColorObject((compH + 25) % 360, 70, 60));
        } else if (type === 'triadic') {
            const h2 = (baseH + 120) % 360;
            const h3 = (baseH + 240) % 360;
            colors.push(createColorObject(baseH, 75, 52));
            colors.push(createColorObject(baseH, 60, 70));
            colors.push(createColorObject(h2, 75, 52));
            colors.push(createColorObject(h3, 75, 52));
            colors.push(createColorObject(h3, 60, 70));
        } else {
            // Random mix
            for (let i = 0; i < 5; i++) {
                colors.push(generateRandomColor());
            }
        }
        return colors;
    }

    btnColorSingle.addEventListener('click', () => {
        activeColorMode = 'single';
        btnColorSingle.classList.add('active');
        btnColorPalette.classList.remove('active');
        paletteTypeWrapper.classList.add('hidden');
        renderColorPreview();
    });

    btnColorPalette.addEventListener('click', () => {
        activeColorMode = 'palette';
        btnColorPalette.classList.add('active');
        btnColorSingle.classList.remove('active');
        paletteTypeWrapper.classList.remove('hidden');
        renderColorPreview();
    });

    selectPaletteType.addEventListener('change', () => {
        activePaletteType = selectPaletteType.value;
        if (activeColorMode === 'palette') {
            generateColorResult(false);
        }
    });

    function renderColorPreview() {
        if (!currentColorData) return;
        colorPreviewContainer.innerHTML = '';

        if (activeColorMode === 'single') {
            const c = Array.isArray(currentColorData) ? currentColorData[0] : currentColorData;
            const card = document.createElement('div');
            card.className = 'single-color-card';
            card.style.backgroundColor = c.hex;
            card.style.color = c.textColor;
            card.title = 'Click to copy HEX code';

            card.innerHTML = `
                <span class="color-hex-main">${c.hex}</span>
                <div class="color-values-row">
                    <span class="color-code-pill">${c.rgb}</span>
                    <span class="color-code-pill">${c.hsl}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                copyTextToClipboard(c.hex, `Copied ${c.hex}`);
            });

            colorPreviewContainer.appendChild(card);

            // Sync ambient background glow with generated color
            if (glowOrb1) glowOrb1.style.background = `radial-gradient(circle, ${c.hex} 0%, transparent 70%)`;
        } else {
            const colors = Array.isArray(currentColorData) ? currentColorData : generateColorPalette(activePaletteType);
            currentColorData = colors;

            const grid = document.createElement('div');
            grid.className = 'palette-grid';

            colors.forEach(col => {
                const swatch = document.createElement('div');
                swatch.className = 'palette-swatch';
                swatch.style.backgroundColor = col.hex;
                swatch.style.color = col.textColor;
                swatch.title = `Click to copy ${col.hex}`;

                swatch.innerHTML = `
                    <span class="palette-swatch-hex">${col.hex}</span>
                `;

                swatch.addEventListener('click', (e) => {
                    e.stopPropagation();
                    copyTextToClipboard(col.hex, `Copied ${col.hex}`);
                });

                grid.appendChild(swatch);
            });

            colorPreviewContainer.appendChild(grid);
        }
    }

    function generateColorResult(isRollAction = true) {
        if (activeColorMode === 'single') {
            const color = generateRandomColor();
            currentColorData = color;
            renderColorPreview();

            return {
                primary: color.hex,
                raw: `${color.hex} • ${color.rgb} • ${color.hsl}`,
                breakdown: `${color.rgb} • ${color.hsl}`,
                detailTitle: 'Single Color',
                mode: 'color'
            };
        } else {
            const palette = generateColorPalette(activePaletteType);
            currentColorData = palette;
            renderColorPreview();

            const hexList = palette.map(c => c.hex).join(', ');
            return {
                primary: palette.map(c => c.hex).join(' '),
                raw: hexList,
                breakdown: `5-Color Palette (${activePaletteType.toUpperCase()})`,
                detailTitle: 'Color Palette',
                mode: 'color'
            };
        }
    }

    // =========================================================================
    // Mode 4: Dice & Coins Logic (Direct 1-Coin Flip, No clutter)
    // =========================================================================
    btnSubmodeDice.addEventListener('click', () => {
        activeDiceSubmode = 'dice';
        btnSubmodeDice.classList.add('active');
        btnSubmodeCoin.classList.remove('active');
        diceControlsSection.classList.remove('hidden');
        coinControlsSection.classList.add('hidden');
    });

    btnSubmodeCoin.addEventListener('click', () => {
        activeDiceSubmode = 'coin';
        btnSubmodeCoin.classList.add('active');
        btnSubmodeDice.classList.remove('active');
        coinControlsSection.classList.remove('hidden');
        diceControlsSection.classList.add('hidden');
    });

    document.querySelectorAll('.dice-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dice-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeDiceSides = parseInt(btn.getAttribute('data-sides'), 10) || 6;
        });
    });

    function generateDiceResult() {
        if (activeDiceSubmode === 'coin') {
            // Direct clean 1-coin toss
            const flip = cryptoRandomFloat() < 0.5 ? 'Heads' : 'Tails';
            const icon = flip === 'Heads' ? '🪙' : '🦅';

            return {
                primary: `${flip} ${icon}`,
                raw: flip,
                breakdown: `Coin Flip: ${flip}`,
                detailTitle: 'Coin Flip',
                mode: 'dice'
            };
        } else {
            let count = parseInt(diceCount.value, 10);
            if (isNaN(count) || count < 1) count = 1;
            if (count > 12) count = 12;

            let mod = parseInt(diceModifier.value, 10);
            if (isNaN(mod)) mod = 0;

            const rolls = [];
            for (let i = 0; i < count; i++) {
                rolls.push(cryptoRandomInt(1, activeDiceSides));
            }

            const sum = rolls.reduce((a, b) => a + b, 0);
            const total = sum + mod;

            const modStr = mod > 0 ? ` + ${mod}` : (mod < 0 ? ` - ${Math.abs(mod)}` : '');
            const breakdownStr = count > 1 || mod !== 0
                ? `Rolls: [${rolls.join(', ')}]${modStr} = Total: ${total}`
                : `Single D${activeDiceSides}`;

            return {
                primary: String(total),
                raw: `${total} (${count}d${activeDiceSides}${modStr})`,
                breakdown: breakdownStr,
                detailTitle: `${count}d${activeDiceSides}${modStr}`,
                mode: 'dice'
            };
        }
    }

    // =========================================================================
    // Core Roll Engine & The 6-Tick Animated Deceleration
    // =========================================================================
    function getCandidateResult(isFinal = true) {
        switch (activeTab) {
            case 'numbers': return generateNumbersResult();
            case 'list': return generateListResult(isFinal);
            case 'colors': return generateColorResult(true);
            case 'dice': return generateDiceResult();
            default: return generateNumbersResult();
        }
    }

    function executeRoll() {
        if (isRolling) return;

        // Verify validity before starting animation without side effects
        const initialCheck = getCandidateResult(false);
        if (!initialCheck) return;

        isRolling = true;
        btnRoll.classList.add('rolling');
        statusBadge.className = 'badge badge-rolling';
        statusText.textContent = 'ROLLING...';

        if (!isAnimated) {
            // Instant generation (Animated OFF)
            const finalResult = getCandidateResult(true);
            displayFinalResult(finalResult);
            isRolling = false;
            btnRoll.classList.remove('rolling');
            return;
        }

        // =====================================================================
        // ANIMATED MODE: Exactly 6 rapid intermediate random ticks, then 7th final
        // =====================================================================
        const intermediateDelays = [45, 60, 80, 105, 135, 175]; // Easing deceleration
        let tick = 0;

    function adjustPrimaryFontSize(text) {
        if (!text) return;
        const len = String(text).length;
        if (len > 35) {
            primaryResultText.style.fontSize = '1.35rem';
        } else if (len > 20) {
            primaryResultText.style.fontSize = '1.8rem';
        } else if (len > 12) {
            primaryResultText.style.fontSize = '2.2rem';
        } else {
            primaryResultText.style.fontSize = '';
        }
    }

    function runNextTick() {
        if (tick < 6) {
            // Ticks 1 to 6: Intermediate random values (non-final)
            const intermediate = getCandidateResult(false);
            if (intermediate) {
                adjustPrimaryFontSize(intermediate.primary);
                primaryResultText.textContent = intermediate.primary;
                primaryResultText.classList.add('animating');
                playTickSound();
            }
            const delay = intermediateDelays[tick];
            tick++;
            setTimeout(runNextTick, delay);
        } else {
            // Tick 7: Final Chosen Value Lock-in!
            const finalResult = getCandidateResult(true);
            displayFinalResult(finalResult);
            isRolling = false;
            btnRoll.classList.remove('rolling');
        }
    }

    runNextTick();
}

function displayFinalResult(result) {
    if (!result) return;

    latestResultRaw = result.raw || result.primary;

    primaryResultText.classList.remove('animating');
    primaryResultText.classList.remove('result-pop');
    adjustPrimaryFontSize(result.primary);
    void primaryResultText.offsetWidth; // Trigger reflow for CSS keyframe
    primaryResultText.classList.add('result-pop');
    primaryResultText.textContent = result.primary;

    if (result.breakdown) {
        resultBreakdown.innerHTML = `<span>${result.breakdown}</span>`;
        resultBreakdown.classList.remove('hidden');
    } else {
        resultBreakdown.classList.add('hidden');
    }

        // Play resolution chime
        playSuccessSound();

        // Status badge update
        statusBadge.className = 'badge badge-ready';
        statusText.textContent = 'RESULT';

        // Increment roll counter
        totalRollsCount++;
        statTotalRolls.textContent = String(totalRollsCount);
        try {
            localStorage.setItem(STORAGE_KEY_TOTAL_ROLLS, String(totalRollsCount));
        } catch (e) {}

        // Add to history
        addHistoryItem(result);
    }

    // =========================================================================
    // History Management (Time-Calculator Style)
    // =========================================================================
    function addHistoryItem(result) {
        const item = {
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            mode: result.mode,
            title: result.detailTitle,
            value: result.primary,
            raw: result.raw || result.primary
        };

        historyList.unshift(item);
        if (historyList.length > 80) {
            historyList.pop();
        }

        saveHistoryToStorage();
        renderHistoryList();
    }

    function saveHistoryToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
        } catch (e) {}
    }

    function renderHistoryList() {
        if (statCount) statCount.textContent = String(historyList.length);

        if (historyList.length === 0) {
            historyEmpty.classList.remove('hidden');
            historyItemsList.classList.add('hidden');
            historyItemsList.innerHTML = '';
            return;
        }

        historyEmpty.classList.add('hidden');
        historyItemsList.classList.remove('hidden');
        historyItemsList.innerHTML = '';

        historyList.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'saved-item-row';

            const badgeClass = `badge-${item.mode}`;

            row.innerHTML = `
                <div class="item-left">
                    <span class="item-num">#${historyList.length - index}</span>
                    <span class="item-badge ${badgeClass}">${item.mode}</span>
                    <span class="item-time">${item.time}</span>
                </div>
                <div class="item-right">
                    <span class="item-value" title="${item.value}">${item.value}</span>
                    <div class="item-actions">
                        <button type="button" class="item-btn item-btn-copy" title="Copy result">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button type="button" class="item-btn item-btn-remove" title="Remove from list">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            // Click row to copy
            row.addEventListener('click', (e) => {
                if (e.target.closest('.item-btn-remove')) return;
                copyTextToClipboard(item.raw, `Copied ${item.raw}`);
            });

            row.querySelector('.item-btn-copy').addEventListener('click', (e) => {
                e.stopPropagation();
                copyTextToClipboard(item.raw, `Copied ${item.raw}`);
            });

            row.querySelector('.item-btn-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                historyList = historyList.filter(h => h.id !== item.id);
                saveHistoryToStorage();
                renderHistoryList();
            });

            historyItemsList.appendChild(row);
        });
    }

    btnClearHistory.addEventListener('click', () => {
        if (historyList.length === 0) return;
        historyList = [];
        saveHistoryToStorage();
        renderHistoryList();
        showToast('History cleared');
    });

    btnCopyHistory.addEventListener('click', () => {
        if (historyList.length === 0) {
            showToast('History is empty');
            return;
        }
        const text = historyList.map(h => `[${h.time}] (${h.mode.toUpperCase()}) ${h.value}`).join('\n');
        copyTextToClipboard(text, 'All history copied to clipboard');
        if (copySummaryText) {
            const prev = copySummaryText.textContent;
            copySummaryText.textContent = 'Copied!';
            setTimeout(() => { copySummaryText.textContent = prev; }, 1500);
        }
    });

    // =========================================================================
    // Copy To Clipboard & Toast Helper
    // =========================================================================
    function copyTextToClipboard(text, successMsg) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    if (successMsg) showToast(successMsg);
                    triggerCopiedBadge();
                })
                .catch(() => fallbackCopy(text, successMsg));
        } else {
            fallbackCopy(text, successMsg);
        }
    }

    function fallbackCopy(text, successMsg) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            if (successMsg) showToast(successMsg);
            triggerCopiedBadge();
        } catch (e) {
            showToast('Unable to copy');
        }
        document.body.removeChild(ta);
    }

    function triggerCopiedBadge() {
        const prevText = statusText.textContent;
        const prevClass = statusBadge.className;
        statusBadge.className = 'badge badge-copied';
        statusText.textContent = 'COPIED';
        setTimeout(() => {
            statusBadge.className = prevClass;
            statusText.textContent = prevText;
        }, 1200);
    }

    function showToast(msg) {
        while (toastContainer.children.length >= 3) {
            toastContainer.firstElementChild.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode === toastContainer) {
                toast.remove();
            }
        }, 2200);
    }

    btnCopyResult.addEventListener('click', () => {
        if (!latestResultRaw || latestResultRaw === 'READY') {
            showToast('No result to copy yet');
            return;
        }
        copyTextToClipboard(latestResultRaw, 'Result copied to clipboard');
    });

    // =========================================================================
    // Global Switches (Animated & Sound)
    // =========================================================================
    toggleAnimated.addEventListener('change', () => {
        isAnimated = toggleAnimated.checked;
        animIndicatorTag.textContent = isAnimated ? '6-Tick Roulette' : 'Instant Pick';
        animIndicatorTag.classList.toggle('anim-active', isAnimated);
        try {
            localStorage.setItem(STORAGE_KEY_ANIMATED, isAnimated ? '1' : '0');
        } catch (e) {}
        showToast(`Animation ${isAnimated ? 'Enabled' : 'Disabled'}`);
    });

    btnToggleSound.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        updateSoundUI();
        try {
            localStorage.setItem(STORAGE_KEY_SOUND, isSoundEnabled ? '1' : '0');
        } catch (e) {}
        showToast(`Sound ${isSoundEnabled ? 'On' : 'Muted'}`);
        if (isSoundEnabled) playTickSound();
    });

    function updateSoundUI() {
        if (isSoundEnabled) {
            iconSoundOn.classList.remove('hidden');
            iconSoundOff.classList.add('hidden');
            btnToggleSound.classList.add('active');
        } else {
            iconSoundOn.classList.add('hidden');
            iconSoundOff.classList.remove('hidden');
            btnToggleSound.classList.remove('active');
        }
    }

    // Primary Roll Button
    btnRoll.addEventListener('click', executeRoll);

    // Keyboard Shortcuts: Space or Enter to Roll (when not in input/textarea)
    window.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
            // Allow Enter to submit if on a number input
            if (e.key === 'Enter' && activeTag === 'input') {
                e.preventDefault();
                executeRoll();
            }
            return;
        }

        if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            executeRoll();
        }
    });

    // =========================================================================
    // Initialization & State Restoration
    // =========================================================================
    function init() {
        // Restore Animated state
        try {
            const savedAnim = localStorage.getItem(STORAGE_KEY_ANIMATED);
            if (savedAnim !== null) {
                isAnimated = savedAnim === '1';
                toggleAnimated.checked = isAnimated;
            }
        } catch (e) {}
        animIndicatorTag.textContent = isAnimated ? '6-Tick Roulette' : 'Instant Pick';
        animIndicatorTag.classList.toggle('anim-active', isAnimated);

        // Restore Sound state
        try {
            const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);
            if (savedSound !== null) {
                isSoundEnabled = savedSound === '1';
            }
        } catch (e) {}
        updateSoundUI();

        // Restore Total Rolls Count
        try {
            const savedRolls = localStorage.getItem(STORAGE_KEY_TOTAL_ROLLS);
            if (savedRolls) {
                totalRollsCount = parseInt(savedRolls, 10) || 0;
                statTotalRolls.textContent = String(totalRollsCount);
            }
        } catch (e) {}

        // Restore History
        try {
            const savedHist = localStorage.getItem(STORAGE_KEY_HISTORY);
            if (savedHist) {
                historyList = JSON.parse(savedHist);
                if (!Array.isArray(historyList)) historyList = [];
            }
        } catch (e) {}
        renderHistoryList();

        // Initialize default list if empty
        if (!listInput.value.trim()) {
            listInput.value = 'Option 1\nOption 2\nOption 3';
        }
        updateListCounter();

        // Preload color state
        currentColorData = generateRandomColor();
        renderColorPreview();
    }

    init();
});
