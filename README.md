# Randomizer

A fast, private, client-side randomizer for numbers, lists, colors, dice, and coins with smooth animated roulette rolling and docked history tracking.

## Features

- **Numbers Randomizer**: Generate random numbers within any range ($n$ to $m$), with support for multi-quantity generation, unique constraints (no duplicates), decimals, and sorting (ascending / descending).
- **Phrases & List Randomizer**: Enter items or phrases line-by-line or comma-separated, pick single or multiple items, randomly shuffle, and optionally remove selected items from the list so they do not repeat.
- **Color Studio**: Generate vibrant random colors in HEX, RGB, and HSL with automatic adaptive text contrast and reactive ambient background glow, or generate 5-color harmonious palettes (Random, Pastel, Complementary, Triadic, Monochromatic).
- **Dice & Coins**: Roll standard RPG dice (D4, D6, D8, D10, D12, D20, D100) with quantity and modifiers, or flip a classic coin (Heads / Tails).
- **6-Tick Animated Roulette**: Toggleable deceleration animation that rapidly cycles through 6 intermediate candidates before locking onto the 7th winning result with audio feedback and pop effects.
- **Docked History Sidebar**: Log all previous rolls with timestamp, mode tag, and result. One-click copy for individual rolls or the entire history report.
- **Zero Dependencies & Complete Privacy**: Runs 100% locally in the browser with cryptographic fairness (`crypto.getRandomValues`) and zero tracking or server requests.

## Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Responsive Design)
- **Programming Language**: JavaScript (ES6+, Web Audio API, Web Crypto API)
- **Typography**: Inter, JetBrains Mono
- **Design System**: GitHub Dark Graphite / Primer Dark

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
