/**
 * Signature Analyzer - Advanced Graphology Analysis
 * Analyzes 20 characteristics from signature image
 */

/**
 * Main analysis function
 * @param {string} signatureDataUrl - Base64 data URL of signature image
 * @returns {Object} Analysis results with 20 characteristics
 */
export function analyzeSignature(signatureDataUrl) {
  // Create image from data URL
  const img = new Image()
  img.src = signatureDataUrl

  // Create canvas for analysis
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Set canvas size to match image
  canvas.width = img.width
  canvas.height = img.height

  // Draw image on canvas
  ctx.drawImage(img, 0, 0)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  // Extract signature metrics
  const metrics = extractSignatureMetrics(pixels, canvas.width, canvas.height)

  // Analyze 20 characteristics
  const characteristics = {
    // Basic characteristics (free tier - 5)
    size: analyzeSize(metrics),
    slant: analyzeSlant(metrics),
    pressure: analyzePressure(metrics),
    legibility: analyzeLegibility(metrics),
    speed: analyzeSpeed(metrics),

    // Advanced characteristics (premium - 15 additional)
    flourish: analyzeFlourish(metrics),
    placement: analyzePlacement(metrics),
    letterConnection: analyzeLetterConnection(metrics),
    strokeDirection: analyzeStrokeDirection(metrics),
    margins: analyzeMargins(metrics),
    proportions: analyzeProportions(metrics),
    symmetry: analyzeSymmetry(metrics),
    ornamentation: analyzeOrnamentation(metrics),
    finalStroke: analyzeFinalStroke(metrics),
    cohesion: analyzeCohesion(metrics),
    writingZone: analyzeWritingZone(metrics),
    anglesVsCurves: analyzeAnglesVsCurves(metrics),
    fluidity: analyzeFluidity(metrics),
    tremor: analyzeTremor(metrics),
    uniqueness: analyzeUniqueness(metrics)
  }

  // Generate personality profile
  const profile = generatePersonalityProfile(characteristics)

  // Generate archetype
  const archetype = determineArchetype(characteristics)

  return {
    characteristics,
    profile,
    archetype,
    timestamp: new Date().toISOString()
  }
}

/**
 * Extract metrics from signature pixels
 */
function extractSignatureMetrics(pixels, width, height) {
  let minX = width, maxX = 0, minY = height, maxY = 0
  let totalPixels = 0
  let darkPixelSum = 0
  let centerOfMassX = 0, centerOfMassY = 0

  const darkPixels = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const brightness = (r + g + b) / 3

      // Consider dark pixels as part of signature
      if (brightness < 200) {
        totalPixels++
        const darkness = 255 - brightness
        darkPixelSum += darkness
        centerOfMassX += x * darkness
        centerOfMassY += y * darkness

        darkPixels.push({ x, y, darkness })

        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (totalPixels === 0) {
    // No signature detected
    return getDefaultMetrics()
  }

  centerOfMassX /= darkPixelSum
  centerOfMassY /= darkPixelSum

  const signatureWidth = maxX - minX
  const signatureHeight = maxY - minY
  const area = totalPixels
  const density = totalPixels / (signatureWidth * signatureHeight || 1)
  const aspectRatio = signatureWidth / (signatureHeight || 1)

  // Calculate average darkness (pressure indicator)
  const avgDarkness = darkPixelSum / totalPixels

  // Calculate complexity (how many direction changes)
  const complexity = calculateComplexity(darkPixels)

  // Calculate horizontal distribution
  const horizontalDistribution = calculateHorizontalDistribution(darkPixels, width)

  // Calculate vertical distribution
  const verticalDistribution = calculateVerticalDistribution(darkPixels, height)

  return {
    width: signatureWidth,
    height: signatureHeight,
    area,
    density,
    aspectRatio,
    centerOfMassX,
    centerOfMassY,
    avgDarkness,
    complexity,
    horizontalDistribution,
    verticalDistribution,
    canvasWidth: width,
    canvasHeight: height,
    darkPixels,
    minX,
    maxX,
    minY,
    maxY
  }
}

function getDefaultMetrics() {
  return {
    width: 0,
    height: 0,
    area: 0,
    density: 0,
    aspectRatio: 1,
    centerOfMassX: 0,
    centerOfMassY: 0,
    avgDarkness: 0,
    complexity: 0,
    horizontalDistribution: { left: 0, center: 0, right: 0 },
    verticalDistribution: { top: 0, middle: 0, bottom: 0 },
    canvasWidth: 0,
    canvasHeight: 0,
    darkPixels: [],
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0
  }
}

function calculateComplexity(darkPixels) {
  if (darkPixels.length < 10) return 0

  // Sample pixels to calculate direction changes
  const sampleSize = Math.min(100, darkPixels.length)
  const step = Math.floor(darkPixels.length / sampleSize)

  let directionChanges = 0
  let prevDirection = null

  for (let i = step; i < darkPixels.length; i += step) {
    const curr = darkPixels[i]
    const prev = darkPixels[i - step]

    const dx = curr.x - prev.x
    const dy = curr.y - prev.y
    const direction = Math.atan2(dy, dx)

    if (prevDirection !== null) {
      const diff = Math.abs(direction - prevDirection)
      if (diff > 0.5) directionChanges++
    }

    prevDirection = direction
  }

  return directionChanges / sampleSize
}

function calculateHorizontalDistribution(darkPixels, width) {
  const third = width / 3
  let left = 0, center = 0, right = 0

  darkPixels.forEach(pixel => {
    if (pixel.x < third) left++
    else if (pixel.x < third * 2) center++
    else right++
  })

  const total = darkPixels.length || 1
  return {
    left: left / total,
    center: center / total,
    right: right / total
  }
}

function calculateVerticalDistribution(darkPixels, height) {
  const third = height / 3
  let top = 0, middle = 0, bottom = 0

  darkPixels.forEach(pixel => {
    if (pixel.y < third) top++
    else if (pixel.y < third * 2) middle++
    else bottom++
  })

  const total = darkPixels.length || 1
  return {
    top: top / total,
    middle: middle / total,
    bottom: bottom / total
  }
}

// ===== CHARACTERISTIC ANALYSIS FUNCTIONS =====

/**
 * 1. SIZE - Analyzes signature size (self-esteem, social presence)
 */
function analyzeSize(metrics) {
  const relativeSize = metrics.area / (metrics.canvasWidth * metrics.canvasHeight || 1)

  let score, level, interpretation

  if (relativeSize > 0.3) {
    score = 85
    level = 'Large'
    interpretation = 'High self-esteem and strong social presence. You enjoy being noticed and tend to think big. Natural confidence in your abilities.'
  } else if (relativeSize > 0.15) {
    score = 60
    level = 'Medium'
    interpretation = 'Balanced self-esteem. You are comfortable in social situations without needing to dominate. Realistic self-perception.'
  } else {
    score = 35
    level = 'Small'
    interpretation = 'Modest and detail-oriented. You prefer working behind the scenes. High concentration ability and precision in tasks.'
  }

  return { score, level, interpretation, category: 'Self-Esteem & Presence' }
}

/**
 * 2. SLANT - Analyzes signature inclination (emotional orientation)
 */
function analyzeSlant(metrics) {
  // Calculate slant from center of mass position
  const horizontalPos = metrics.centerOfMassX / metrics.canvasWidth
  const verticalPos = metrics.centerOfMassY / metrics.canvasHeight

  let score, level, interpretation

  if (horizontalPos > 0.6) {
    score = 75
    level = 'Forward/Ascending'
    interpretation = 'Future-oriented and optimistic. You embrace new challenges with enthusiasm. Progressive mindset and forward-thinking nature.'
  } else if (horizontalPos > 0.4) {
    score = 50
    level = 'Neutral/Balanced'
    interpretation = 'Well-balanced between past and future. You learn from experience while staying open to new possibilities. Realistic outlook.'
  } else {
    score = 30
    level = 'Backward/Descending'
    interpretation = 'Reflective and cautious. You value tradition and past experiences. Thoughtful decision-making based on lessons learned.'
  }

  return { score, level, interpretation, category: 'Temporal Orientation' }
}

/**
 * 3. PRESSURE - Analyzes stroke pressure (energy, determination)
 */
function analyzePressure(metrics) {
  const pressureLevel = metrics.avgDarkness / 255

  let score, level, interpretation

  if (pressureLevel > 0.6) {
    score = 80
    level = 'Strong'
    interpretation = 'High energy and strong determination. You commit fully to your goals. Passionate and emotionally intense in your pursuits.'
  } else if (pressureLevel > 0.3) {
    score = 55
    level = 'Medium'
    interpretation = 'Balanced energy levels. You know when to push forward and when to conserve energy. Adaptable to different situations.'
  } else {
    score = 35
    level = 'Light'
    interpretation = 'Sensitive and adaptable. You prefer gentle persuasion over force. Diplomatic approach and emotional sensitivity.'
  }

  return { score, level, interpretation, category: 'Energy & Determination' }
}

/**
 * 4. LEGIBILITY - Analyzes clarity (transparency, communication)
 */
function analyzeLegibility(metrics) {
  // Based on density and complexity
  const legibilityScore = (1 - metrics.complexity) * metrics.density

  let score, level, interpretation

  if (legibilityScore > 0.6) {
    score = 75
    level = 'Clear'
    interpretation = 'Open and transparent communicator. You value clarity in relationships. Honest and straightforward in your dealings.'
  } else if (legibilityScore > 0.3) {
    score = 50
    level = 'Semi-legible'
    interpretation = 'Balance between openness and privacy. You share selectively. Diplomatic in communication.'
  } else {
    score = 30
    level = 'Complex/Illegible'
    interpretation = 'Private and reserved. You value your personal space. Selective in sharing personal information. Mystery can be intriguing.'
  }

  return { score, level, interpretation, category: 'Communication Style' }
}

/**
 * 5. SPEED - Analyzes apparent writing speed (spontaneity)
 */
function analyzeSpeed(metrics) {
  // Based on fluidity and simplicity
  const speedIndicator = 1 - (metrics.complexity * 0.7)

  let score, level, interpretation

  if (speedIndicator > 0.7) {
    score = 80
    level = 'Fast/Fluid'
    interpretation = 'Quick thinker and spontaneous. You make decisions rapidly and trust your instincts. Dynamic and adaptable personality.'
  } else if (speedIndicator > 0.4) {
    score = 55
    level = 'Moderate'
    interpretation = 'Balanced between spontaneity and reflection. You think things through but don\'t overthink. Practical decision-making.'
  } else {
    score = 35
    level = 'Slow/Deliberate'
    interpretation = 'Thoughtful and methodical. You prefer to analyze before acting. Detail-oriented and careful in your approach.'
  }

  return { score, level, interpretation, category: 'Decision-Making Speed' }
}

/**
 * 6. FLOURISH - Analyzes decorative elements (creativity, self-protection)
 */
function analyzeFlourish(metrics) {
  // Based on complexity and ornamentation
  const flourishLevel = metrics.complexity

  let score, level, interpretation

  if (flourishLevel > 0.7) {
    score = 85
    level = 'Elaborate'
    interpretation = 'Creative and expressive. You add personal flair to everything you do. Strong sense of individuality and artistic nature.'
  } else if (flourishLevel > 0.4) {
    score = 60
    level = 'Moderate'
    interpretation = 'Balanced between simplicity and creativity. You appreciate aesthetics without going overboard. Practical creativity.'
  } else {
    score = 40
    level = 'Minimal'
    interpretation = 'Straightforward and practical. You prefer substance over style. Minimalist approach focused on essentials.'
  }

  return { score, level, interpretation, category: 'Creativity & Expression' }
}

/**
 * 7. PLACEMENT - Analyzes spatial position (self-perception, orientation)
 */
function analyzePlacement(metrics) {
  const { horizontalDistribution, verticalDistribution } = metrics

  let score, level, interpretation

  if (horizontalDistribution.right > 0.5) {
    score = 70
    level = 'Right-oriented'
    interpretation = 'Future-focused and extroverted. You look forward to what\'s next. Progressive and action-oriented mindset.'
  } else if (horizontalDistribution.left > 0.5) {
    score = 40
    level = 'Left-oriented'
    interpretation = 'Past-conscious and introspective. You value history and tradition. Reflective and cautious approach.'
  } else if (verticalDistribution.top > 0.5) {
    score = 75
    level = 'Upper-oriented'
    interpretation = 'Idealistic and aspirational. You aim high and dream big. Intellectual and spiritual focus.'
  } else if (verticalDistribution.bottom > 0.5) {
    score = 45
    level = 'Lower-oriented'
    interpretation = 'Practical and grounded. You focus on concrete realities. Material and physical world orientation.'
  } else {
    score = 60
    level = 'Centered'
    interpretation = 'Well-balanced perspective. You live in the present while considering past and future. Equilibrium in outlook.'
  }

  return { score, level, interpretation, category: 'Spatial Orientation' }
}

/**
 * 8. LETTER CONNECTION - Analyzes continuity (logical thinking)
 */
function analyzeLetterConnection(metrics) {
  // Based on density and fluidity
  const connectionLevel = metrics.density * (1 - metrics.complexity * 0.3)

  let score, level, interpretation

  if (connectionLevel > 0.6) {
    score = 75
    level = 'Highly Connected'
    interpretation = 'Logical and systematic thinker. You follow thoughts through to completion. Analytical mind with strong reasoning.'
  } else if (connectionLevel > 0.3) {
    score = 55
    level = 'Moderately Connected'
    interpretation = 'Balance between logic and intuition. You use both analytical and creative thinking. Flexible problem-solving.'
  } else {
    score = 40
    level = 'Disconnected'
    interpretation = 'Intuitive and creative thinker. You make unexpected connections. Original ideas and innovative approach.'
  }

  return { score, level, interpretation, category: 'Thinking Style' }
}

/**
 * 9. STROKE DIRECTION - Analyzes directional flow
 */
function analyzeStrokeDirection(metrics) {
  const variability = metrics.complexity

  let score, level, interpretation

  if (variability < 0.3) {
    score = 70
    level = 'Consistent/Straight'
    interpretation = 'Disciplined and focused. You maintain consistent direction in life. Structured and organized approach.'
  } else if (variability < 0.6) {
    score = 60
    level = 'Moderately Varied'
    interpretation = 'Flexible yet consistent. You adapt while maintaining core values. Balanced approach to change.'
  } else {
    score = 50
    level = 'Highly Varied/Curved'
    interpretation = 'Adaptable and versatile. You easily adjust to new situations. Emotional and empathetic nature.'
  }

  return { score, level, interpretation, category: 'Consistency & Flexibility' }
}

/**
 * 10. MARGINS - Analyzes use of space
 */
function analyzeMargins(metrics) {
  const spaceUsage = metrics.area / (metrics.canvasWidth * metrics.canvasHeight || 1)

  let score, level, interpretation

  if (spaceUsage > 0.4) {
    score = 65
    level = 'Narrow Margins'
    interpretation = 'Generous and outgoing. You fully engage with the world around you. Sociable and expressive nature.'
  } else if (spaceUsage > 0.15) {
    score = 55
    level = 'Balanced Margins'
    interpretation = 'Healthy boundaries. You balance personal space with social engagement. Well-proportioned life approach.'
  } else {
    score = 45
    level = 'Wide Margins'
    interpretation = 'Reserved and careful. You value personal space and boundaries. Thoughtful about resource allocation.'
  }

  return { score, level, interpretation, category: 'Space Management' }
}

/**
 * 11. PROPORTIONS - Analyzes ratio of elements
 */
function analyzeProportions(metrics) {
  const aspectRatio = metrics.aspectRatio

  let score, level, interpretation

  if (aspectRatio > 4) {
    score = 70
    level = 'Wide/Horizontal'
    interpretation = 'Expansive thinker. You see the big picture. Broad perspective and wide-ranging interests.'
  } else if (aspectRatio > 2) {
    score = 60
    level = 'Balanced Wide'
    interpretation = 'Good balance between breadth and depth. You consider multiple angles while staying focused.'
  } else if (aspectRatio > 0.5) {
    score = 55
    level = 'Proportionate'
    interpretation = 'Well-balanced in all aspects. Harmonious approach to life. Equilibrium between different areas.'
  } else {
    score = 50
    level = 'Tall/Vertical'
    interpretation = 'Deep thinker. You explore subjects thoroughly. Focused and concentrated approach.'
  }

  return { score, level, interpretation, category: 'Perspective Balance' }
}

/**
 * 12. SYMMETRY - Analyzes balance
 */
function analyzeSymmetry(metrics) {
  // Calculate symmetry from horizontal distribution
  const { left, center, right } = metrics.horizontalDistribution
  const symmetryScore = 1 - Math.abs(left - right)

  let score, level, interpretation

  if (symmetryScore > 0.7) {
    score = 75
    level = 'Highly Symmetric'
    interpretation = 'Emotionally balanced and stable. You maintain equilibrium in life. Organized mind and consistent behavior.'
  } else if (symmetryScore > 0.4) {
    score = 55
    level = 'Moderately Symmetric'
    interpretation = 'Generally balanced with some variability. You adapt to circumstances while maintaining stability.'
  } else {
    score = 40
    level = 'Asymmetric'
    interpretation = 'Spontaneous and dynamic. You embrace change and variety. Flexible and adaptable personality.'
  }

  return { score, level, interpretation, category: 'Emotional Balance' }
}

/**
 * 13. ORNAMENTATION - Analyzes decorative complexity
 */
function analyzeOrnamentation(metrics) {
  const ornamentLevel = metrics.complexity * metrics.density

  let score, level, interpretation

  if (ornamentLevel > 0.5) {
    score = 80
    level = 'Highly Ornamented'
    interpretation = 'Artistic and detail-oriented. You appreciate beauty and aesthetics. Creative expression is important to you.'
  } else if (ornamentLevel > 0.25) {
    score = 60
    level = 'Moderately Ornamented'
    interpretation = 'Balanced approach to aesthetics. You appreciate style without sacrificing substance. Practical creativity.'
  } else {
    score = 45
    level = 'Minimal Ornamentation'
    interpretation = 'Pragmatic and efficient. You focus on functionality over decoration. Clean and straightforward style.'
  }

  return { score, level, interpretation, category: 'Aesthetic Appreciation' }
}

/**
 * 14. FINAL STROKE - Analyzes ending direction
 */
function analyzeFinalStroke(metrics) {
  const { right } = metrics.horizontalDistribution

  let score, level, interpretation

  if (right > 0.4) {
    score = 75
    level = 'Extends Forward'
    interpretation = 'Future-oriented and optimistic. You look ahead with confidence. Proactive and forward-thinking.'
  } else if (right > 0.25) {
    score = 55
    level = 'Balanced Ending'
    interpretation = 'Closure-oriented. You complete tasks thoroughly. Balanced between moving forward and consolidating.'
  } else {
    score = 45
    level = 'Returns/Hooks Back'
    interpretation = 'Self-protective and reflective. You secure what you\'ve achieved. Careful about commitments.'
  }

  return { score, level, interpretation, category: 'Future Orientation' }
}

/**
 * 15. COHESION - Analyzes overall unity
 */
function analyzeCohesion(metrics) {
  const cohesionLevel = metrics.density * (1 - metrics.complexity * 0.5)

  let score, level, interpretation

  if (cohesionLevel > 0.5) {
    score = 75
    level = 'Highly Cohesive'
    interpretation = 'Internally consistent and reliable. Your thoughts and actions align. Strong personal integrity.'
  } else if (cohesionLevel > 0.25) {
    score = 55
    level = 'Moderately Cohesive'
    interpretation = 'Generally consistent with room for growth. You balance stability with flexibility. Adaptive coherence.'
  } else {
    score = 40
    level = 'Fragmented'
    interpretation = 'Multifaceted personality. You contain contradictions. Complex and evolving self-concept.'
  }

  return { score, level, interpretation, category: 'Internal Consistency' }
}

/**
 * 16. WRITING ZONE - Analyzes predominant vertical zone
 */
function analyzeWritingZone(metrics) {
  const { top, middle, bottom } = metrics.verticalDistribution

  let score, level, interpretation

  if (top > 0.45) {
    score = 70
    level = 'Upper Zone Dominant'
    interpretation = 'Intellectual and aspirational. You focus on ideas and ideals. Spiritual and philosophical interests.'
  } else if (middle > 0.45) {
    score = 60
    level = 'Middle Zone Dominant'
    interpretation = 'Practical and social. You engage with daily life actively. Focus on relationships and immediate concerns.'
  } else if (bottom > 0.45) {
    score = 55
    level = 'Lower Zone Dominant'
    interpretation = 'Physical and material focus. You value tangible results. Practical and grounded in reality.'
  } else {
    score = 65
    level = 'Balanced Zones'
    interpretation = 'Holistic approach to life. You balance intellectual, social, and material aspects. Well-rounded personality.'
  }

  return { score, level, interpretation, category: 'Life Focus Areas' }
}

/**
 * 17. ANGLES VS CURVES - Analyzes stroke quality
 */
function analyzeAnglesVsCurves(metrics) {
  // Higher complexity suggests more angles
  const angleLevel = metrics.complexity

  let score, level, interpretation

  if (angleLevel > 0.6) {
    score = 70
    level = 'Angular'
    interpretation = 'Analytical and logical. You approach problems rationally. Strong willpower and determination.'
  } else if (angleLevel > 0.3) {
    score = 60
    level = 'Mixed'
    interpretation = 'Balance between logic and emotion. You use both head and heart in decisions. Flexible thinking.'
  } else {
    score = 55
    level = 'Curved'
    interpretation = 'Empathetic and emotional. You value feelings and relationships. Warm and accommodating nature.'
  }

  return { score, level, interpretation, category: 'Rationality vs Emotionality' }
}

/**
 * 18. FLUIDITY - Analyzes smoothness of execution
 */
function analyzeFluidity(metrics) {
  const fluidityScore = 1 - (metrics.complexity * 0.8)

  let score, level, interpretation

  if (fluidityScore > 0.6) {
    score = 75
    level = 'Highly Fluid'
    interpretation = 'Natural and spontaneous. You act with ease and confidence. Relaxed and comfortable with yourself.'
  } else if (fluidityScore > 0.3) {
    score = 55
    level = 'Moderately Fluid'
    interpretation = 'Generally comfortable with occasional hesitation. You balance spontaneity with thoughtfulness.'
  } else {
    score = 40
    level = 'Interrupted Flow'
    interpretation = 'Careful and deliberate. You think before acting. Conscientious and detail-focused approach.'
  }

  return { score, level, interpretation, category: 'Natural Confidence' }
}

/**
 * 19. TREMOR - Analyzes stability vs nervousness
 */
function analyzeTremor(metrics) {
  // Lower tremor is better (inverse of complexity for this characteristic)
  const stability = 1 - (metrics.complexity * 0.5)

  let score, level, interpretation

  if (stability > 0.7) {
    score = 80
    level = 'Stable/Confident'
    interpretation = 'Calm and composed. You handle pressure well. Emotionally stable and self-assured.'
  } else if (stability > 0.4) {
    score = 60
    level = 'Generally Stable'
    interpretation = 'Mostly calm with normal stress responses. You manage anxiety effectively. Resilient personality.'
  } else {
    score = 45
    level = 'Some Instability'
    interpretation = 'Sensitive to stress. You feel things deeply. High awareness and responsiveness to environment.'
  }

  return { score, level, interpretation, category: 'Emotional Stability' }
}

/**
 * 20. UNIQUENESS - Analyzes distinctive elements
 */
function analyzeUniqueness(metrics) {
  // Combination of complexity and density
  const uniquenessScore = (metrics.complexity * 0.6) + (metrics.density * 0.4)

  let score, level, interpretation

  if (uniquenessScore > 0.6) {
    score = 85
    level = 'Highly Unique'
    interpretation = 'Original and individualistic. You chart your own path. Creative and unconventional thinker.'
  } else if (uniquenessScore > 0.35) {
    score = 60
    level = 'Moderately Unique'
    interpretation = 'Balanced between conformity and individuality. You respect traditions while adding personal touches.'
  } else {
    score = 45
    level = 'Conventional'
    interpretation = 'Traditional and reliable. You value proven methods. Consistent and dependable approach.'
  }

  return { score, level, interpretation, category: 'Individuality' }
}

/**
 * Generate overall personality profile
 */
function generatePersonalityProfile(characteristics) {
  const scores = Object.values(characteristics).map(c => c.score)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

  const strengths = []
  const areasForGrowth = []

  // Identify top 3 strengths (highest scores)
  const sortedChars = Object.entries(characteristics)
    .sort((a, b) => b[1].score - a[1].score)

  strengths.push(sortedChars[0][1].category)
  strengths.push(sortedChars[1][1].category)
  strengths.push(sortedChars[2][1].category)

  // Identify areas for growth (lowest scores)
  areasForGrowth.push(sortedChars[sortedChars.length - 1][1].category)
  areasForGrowth.push(sortedChars[sortedChars.length - 2][1].category)
  areasForGrowth.push(sortedChars[sortedChars.length - 3][1].category)

  return {
    overallScore: Math.round(avgScore),
    strengths,
    areasForGrowth,
    summary: generateSummary(characteristics, avgScore)
  }
}

/**
 * Generate personality summary
 */
function generateSummary(characteristics, avgScore) {
  const { size, pressure, legibility, speed } = characteristics

  let summary = ''

  if (avgScore > 70) {
    summary = 'You have a strong, confident personality with clear self-awareness. '
  } else if (avgScore > 50) {
    summary = 'You possess a balanced personality with diverse strengths. '
  } else {
    summary = 'You have a thoughtful, introspective personality. '
  }

  if (size.score > 70) {
    summary += 'Your natural confidence and social presence are notable. '
  }

  if (pressure.score > 70) {
    summary += 'You approach life with energy and determination. '
  }

  if (legibility.score > 70) {
    summary += 'Your transparent communication style builds trust. '
  }

  if (speed.score > 70) {
    summary += 'Your quick thinking and decisiveness are valuable assets.'
  }

  return summary
}

/**
 * Determine personality archetype
 */
function determineArchetype(characteristics) {
  const { size, pressure, flourish, legibility, speed, anglesVsCurves } = characteristics

  // The Leader
  if (size.score > 70 && pressure.score > 70 && legibility.score > 60) {
    return {
      type: 'The Leader',
      icon: '🦁',
      description: 'Natural leadership qualities with confidence and clear communication. You inspire others and take charge when needed.',
      traits: ['Confident', 'Decisive', 'Influential', 'Direct']
    }
  }

  // The Creative
  if (flourish.score > 70 && characteristics.uniqueness.score > 70) {
    return {
      type: 'The Creative',
      icon: '🎨',
      description: 'Artistic soul with original ideas and unique perspective. You see possibilities where others see limitations.',
      traits: ['Imaginative', 'Original', 'Expressive', 'Innovative']
    }
  }

  // The Balanced
  if (characteristics.symmetry.score > 70 && characteristics.cohesion.score > 70) {
    return {
      type: 'The Balanced',
      icon: '🧘',
      description: 'Harmonious personality with emotional stability. You bring calm and perspective to any situation.',
      traits: ['Stable', 'Harmonious', 'Reliable', 'Grounded']
    }
  }

  // The Analytical
  if (anglesVsCurves.score > 65 && speed.score < 50 && characteristics.letterConnection.score > 65) {
    return {
      type: 'The Analytical',
      icon: '🔬',
      description: 'Logical thinker with attention to detail. You solve problems methodically and value precision.',
      traits: ['Logical', 'Precise', 'Methodical', 'Thorough']
    }
  }

  // The Dreamer
  if (characteristics.placement.score > 70 && characteristics.writingZone.level === 'Upper Zone Dominant') {
    return {
      type: 'The Dreamer',
      icon: '💫',
      description: 'Visionary with high aspirations. You inspire others with your ideals and forward-thinking nature.',
      traits: ['Idealistic', 'Aspirational', 'Visionary', 'Optimistic']
    }
  }

  // The Reserved
  if (legibility.score < 40 && size.score < 50) {
    return {
      type: 'The Reserved',
      icon: '🛡️',
      description: 'Private individual who values personal space. Your depth is revealed to those who earn your trust.',
      traits: ['Private', 'Thoughtful', 'Selective', 'Deep']
    }
  }

  // Default: The Explorer
  return {
    type: 'The Explorer',
    icon: '🧭',
    description: 'Balanced individual with diverse interests. You adapt well and bring versatility to everything you do.',
    traits: ['Adaptable', 'Versatile', 'Curious', 'Open-minded']
  }
}
