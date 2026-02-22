---
name: frontend-design
description: Create distinctive, production-grade mobile UI with high design quality. Use this skill when the user asks to build screens, components, or interfaces for the React Native/Expo app (examples include new screens, modal designs, component styling, layout improvements, or when beautifying any mobile UI). Generates creative, polished React Native code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade mobile interfaces that avoid generic "AI slop" aesthetics. Implement real working React Native/Expo code with exceptional attention to aesthetic details and creative choices.

The user provides mobile UI requirements: a screen, component, modal, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (performance on mobile, platform conventions, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working React Native code that is:
- Production-grade and functional on both iOS and Android
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Mobile Aesthetics Guidelines

Focus on:
- **Typography**: Use `expo-font` to load distinctive, characterful fonts from Google Fonts or custom sources. Avoid relying solely on system default fonts. Pair a distinctive display font with a refined body font. Leverage `fontWeight`, `letterSpacing`, and `textTransform` in `StyleSheet` for typographic hierarchy.
- **Color & Theme**: Commit to a cohesive aesthetic. Use the project's theme store (`themeStore.ts`) or a centralized color constants file for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Support both dark and light modes.
- **Motion**: Use `react-native-reanimated` for fluid, performant animations. Focus on high-impact moments: screen entrance animations with staggered reveals create more delight than scattered micro-interactions. Use `Animated` API or Reanimated's `useSharedValue`/`useAnimatedStyle` for gesture-driven and layout animations. Leverage `LayoutAnimation` for simple transitions.
- **Spatial Composition**: Use React Native's Flexbox creatively. Unexpected layouts through `position: 'absolute'`, overlapping elements, asymmetric spacing, and `zIndex` layering. Generous negative space (padding/margin) OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to flat solid colors. Use `expo-linear-gradient` for gradient backgrounds, `react-native-svg` for custom shapes and patterns, shadows via `shadowColor`/`shadowOffset`/`shadowRadius` (iOS) and `elevation` (Android), and `borderRadius` for soft, modern card shapes.

NEVER use generic AI-generated aesthetics like default system fonts with no customization, cliched color schemes (particularly purple gradients on white backgrounds), predictable screen layouts that look like every other app, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common patterns across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and layered visuals. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

**PLATFORM NOTES**:
- Always handle platform differences: use `Platform.select()` or `Platform.OS` for iOS/Android styling divergences (e.g., shadows vs elevation).
- Keep performance in mind: avoid excessive re-renders, use `useCallback`/`useMemo` where needed, prefer `FlatList` over `ScrollView` for long lists.
- Test visual output on both platforms when making significant UI changes.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
