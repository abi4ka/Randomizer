# Randomizer

A fast, private, client-side randomizer for numbers, lists, colors, dice, and coins with animated roulette rolling, docked history tracking, and offline PWA support.

## Features

- **Numbers Randomizer**: Generate random numbers within any range ($n$ to $m$), with support for multi-quantity generation, unique constraints (no duplicates), decimals, and sorting (ascending / descending).
- **List Randomizer**: Enter items or phrases line-by-line or comma-separated, pick single or multiple items, randomly shuffle, and optionally remove selected items from the list so they do not repeat.
- **Color Studio**: Generate vibrant random colors in HEX, RGB, and HSL with automatic adaptive text contrast and reactive ambient background glow, or generate 5-color harmonious palettes (Random, Pastel, Complementary, Triadic, Monochromatic).
- **RPG Dice Roller**: Roll standard tabletop RPG dice (D4, D6, D8, D10, D12, D20, D100) with configurable quantity, custom +/- modifiers, and an individual dice breakdown with total sum.
- **3D Coin Flip**: Flip a classic coin with realistic 3D physics flipping animation, landing either Heads or Tails.
- **Animated Roulette & Audio FX**: Deceleration roll animation with synthesized tactile mechanical clicks and celebration chimes via Web Audio API.
- **Docked History Sidebar**: Log all previous rolls with mode tag, parameters, and color swatches. One-click copy for individual rolls or the entire history report.
- **Local Persistence**: Automatically retains generator settings, sound and animation toggles, and roll history across sessions in `localStorage`.
- **Pure Static & Offline PWA**: Runs 100% locally in the browser with zero dependencies, no server requests, cryptographic fairness (`crypto.getRandomValues`), service worker caching, and complete privacy.

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Responsive Design)
- **Programming Language**: JavaScript (ES6+, Web Crypto API)
- **Audio**: Web Audio API (synthesized mechanical click and chime effects)
- **Typography**: Inter, JetBrains Mono

## Local Development

Since this project consists of standard static assets, no compilation or build steps are required.

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/abi4ka/Randomizer.git
   cd Randomizer
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000` in your web browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
