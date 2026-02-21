# Visualization Examples & UI Components

Visual guide for displaying PlanSight data in the frontend.

---

## Dashboard Layout Recommendation

```
┌─────────────────────────────────────────────────────────┐
│  Project Input Form (Left Sidebar - 30%)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Main Results Panel (Right - 70%)                      │
│  ┌─────────────────────────────────────────┐           │
│  │ Timeline Distribution (Histogram)       │           │
│  │  [Bar Chart with P50/P90/Deadline]      │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │On-Time % │ │P50 Weeks │ │P90 Weeks │              │
│  │  45%     │ │  16.8w   │ │  23.9w   │              │
│  └──────────┘ └──────────┘ └──────────┘              │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ Risk Heatmap (4 Dimensions)             │           │
│  │  [Radar Chart or Grid of Cards]         │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ┌──────────┐ ┌─────────────────────────┐             │
│  │  Stress  │ │  Role Allocation        │             │
│  │  Index   │ │  [Donut Chart]          │             │
│  │  [Gauge] │ │  FE/BE/DevOps           │             │
│  └──────────┘ └─────────────────────────┘             │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ Cost Range                               │           │
│  │  $587,500 ──────────── $892,500         │           │
│  │  (P50)                 (P90)             │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  [AI Insights Section - Collapsible]                   │
│  - Failure Forecast                                     │
│  - Executive Summary                                    │
│  - Task Breakdown                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Timeline Distribution (Primary Chart)

### Visualization Type: Bar Chart or Area Chart

**Data Source**: `histogram` array from `/simulate` response

**Visual Elements**:
- X-axis: Completion time in weeks
- Y-axis: Number of simulations (count)
- Bars/Area: Distribution of outcomes
- Vertical lines:
  - **Green**: Deadline (user input)
  - **Blue**: P50 (median outcome)
  - **Red**: P90 (worst-case planning)

**Color Coding**:
- Bars **before deadline**: Green/success color
- Bars **after deadline**: Red/warning color

**Example UI**:
```
    Completion Time Distribution
    
    200│              ╭──╮
    150│         ╭────┼──┼────╮
    100│    ╭────┼────┼──┼────┼────╮
     50│╭───┼────┼────┼──┼────┼────┼───╮
      0└───┴────┴────┴──┴────┴────┴───┴──
        12w  14w  16w │18w│ 20w  22w │24w
                      │   │           │
                   P50(16.8w) P90(23.9w) 
                   DEADLINE(12w)

    Legend:
    ─── P50: Most likely completion (50% confidence)
    ─── P90: Conservative estimate (90% confidence)
    ─── Deadline: Target date (only 4.5% likely)
```

**Interactive Features**:
- Hover: Show exact week and simulation count
- Click bar: Highlight that week's data
- Toggle: Switch between bar chart and smooth curve

---

## 2. Key Metrics Cards

### On-Time Probability

**Data**: `on_time_probability` (0-1, display as percentage)

**Visual**:
```
┌─────────────────────┐
│   On-Time Chance    │
│                     │
│       45%          │
│   ████░░░░░░       │  <- Progress bar
│                     │
│  🟢 Low confidence  │  <- Color-coded status
└─────────────────────┘
```

**Color Coding**:
- 0-33%: 🔴 Red - "Low confidence"
- 34-66%: 🟡 Yellow - "Moderate confidence"
- 67-100%: 🟢 Green - "High confidence"

### P50 & P90 Weeks

**Data**: `p50_weeks`, `p90_weeks`

**Visual**:
```
┌──────────────┐  ┌──────────────┐
│  Expected    │  │  Worst-Case  │
│              │  │              │
│   16.8       │  │   23.9       │
│   weeks      │  │   weeks      │
│              │  │              │
│  📊 P50      │  │  ⚠️ P90      │
└──────────────┘  └──────────────┘
```

### Expected Overrun

**Data**: `expected_overrun_days`

**Visual**:
```
┌─────────────────────┐
│  Average Delay      │
│  (when late)        │
│                     │
│     +47.1          │
│     days           │
│                     │
│  ⏱️ Plan buffer    │
└─────────────────────┘
```

---

## 3. Risk Heatmap

### Visualization Type: Radar Chart (Recommended) or Grid

**Data Source**: `risk_scores` object from `/simulate` response

**4 Risk Dimensions** (all 0-100):
1. Integration Risk
2. Team Imbalance Risk
3. Scope Creep Risk
4. Learning Curve Risk

### Option A: Radar Chart

```
         Integration (45)
              ╱ ╲
             ╱   ╲
            ╱     ╲
Team (50) ●────────● Learning (40)
           ╲     ╱
            ╲   ╱
             ╲ ╱
         Scope (60)
         
Legend:
● 0-33: Low risk (green)
● 34-66: Medium risk (yellow)
● 67-100: High risk (red)
```

### Option B: Grid of Cards

```
┌──────────────────┐ ┌──────────────────┐
│ Integration      │ │ Team Imbalance   │
│                  │ │                  │
│      45/100     │ │      50/100     │
│  ████████░░░░   │ │  █████████░░░   │
│                  │ │                  │
│  🟡 Medium       │ │  🟡 Medium       │
│  +15% overhead   │ │  More seniors    │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ Scope Creep      │ │ Learning Curve   │
│                  │ │                  │
│      60/100     │ │      40/100     │
│  ████████████░  │ │  ████████░░░░   │
│                  │ │                  │
│  🟡 Medium-High  │ │  🟢 Low-Medium   │
│  +25% risk       │ │  Familiar stack  │
└──────────────────┘ └──────────────────┘
```

**Interactive Features**:
- Hover: Show `risk_uplift` text if available
- Click: Expand to show mitigation suggestions

---

## 4. Team Stress Index

### Visualization Type: Gauge/Meter

**Data**: `team_stress_index` (0-100)

**Visual**:
```
       Team Burnout Risk
       
         67/100
        ┌─────┐
      ┌─┼─────┼─┐
    ┌─┼─┼─────┼─┼─┐
    │ │ │  ●  │ │ │  <- Needle pointing to 67
    └─┴─┴─────┴─┴─┘
     0  33  67  100
     
    🟢 OK  🟡 Elevated  🔴 CRITICAL
    
    Status: ELEVATED
    Recommendation: Consider adding resources
                    or extending timeline
```

**Zones**:
- 0-33: 🟢 OK - "Team load is manageable"
- 34-66: 🟡 Elevated - "Monitor team workload"
- 67-100: 🔴 Critical - "High burnout risk - action needed"

**Alternative: Progress Bar**:
```
┌────────────────────────────────┐
│  Team Stress: 67/100           │
│  ████████████████████░░░░░░░░  │
│  🔴 CRITICAL                    │
│                                 │
│  Actions:                       │
│  • Reduce scope or extend time │
│  • Add senior resources         │
└────────────────────────────────┘
```

---

## 5. Role Allocation

### Visualization Type: Donut/Pie Chart

**Data**: `role_allocation` object

**Visual**:
```
    Recommended Team Mix
    
       ╭─────╮
      ╱  FE   ╲
     │  40%   │
     │╭──────╮│
     ││DevOps││
     ││ 15% ││
     │╰──────╯│
     │   BE   │
      ╲  45% ╱
       ╰─────╯

Legend:
■ Frontend (40%)
■ Backend (45%)
■ DevOps (15%)
```

**Alternative: Bar Breakdown**:
```
┌─────────────────────────────────┐
│  Frontend    ████████ (40%)     │
│  Backend     █████████ (45%)    │
│  DevOps      ███ (15%)          │
└─────────────────────────────────┘

Recommendation:
For a 5-person team: 2 FE, 2 BE, 1 DevOps
```

**Color Scheme**:
- Frontend: Blue (#3B82F6)
- Backend: Green (#10B981)
- DevOps: Orange (#FB923C)

---

## 6. Cost Range

### Visualization Type: Range Bar with Labels

**Data**: `p50_cost`, `p90_cost`, `currency`

**Visual**:
```
┌──────────────────────────────────────┐
│        Project Cost Estimate         │
│                                      │
│  Optimistic (P50)    Conservative   │
│                         (P90)        │
│      $587,500          $892,500      │
│         ●────────────────●           │
│         ████████████████████         │
│                                      │
│  Variance: ±52% ($305,000)           │
│  Most likely: $587K - $892K range    │
└──────────────────────────────────────┘
```

**Alternative: Cards Side-by-Side**:
```
┌─────────────────┐  ┌─────────────────┐
│  Expected Cost  │  │  Worst-Case     │
│                 │  │                 │
│  $587,500       │  │  $892,500       │
│                 │  │                 │
│  📊 P50 (50%)   │  │  ⚠️ P90 (90%)   │
└─────────────────┘  └─────────────────┘

           +$305,000 buffer needed
```

---

## 7. AI Insights Panels

### Failure Forecast

**Data**: `failure_story` (array), `mitigations` (array)

**Visual**:
```
┌───────────────────────────────────────────┐
│  🔮 How This Project Fails                │
├───────────────────────────────────────────┤
│                                           │
│  Most Likely Failure Scenario:            │
│                                           │
│  1. Integration delays cascade due to     │
│     API instability                       │
│                                           │
│  2. Team velocity drops as juniors        │
│     struggle with React + Node            │
│                                           │
│  3. Scope creep adds 20-30% more work    │
│                                           │
│  4. Testing reveals architectural issues  │
│     requiring refactor                    │
│                                           │
├───────────────────────────────────────────┤
│  💡 How to Prevent It:                    │
│                                           │
│  ✓ Add 2 senior developers OR extend     │
│    deadline by 4 weeks                    │
│                                           │
│  ✓ Lock scope early and defer non-       │
│    critical features                      │
│                                           │
│  ✓ Build integration mocks upfront to    │
│    derisk dependencies                    │
│                                           │
└───────────────────────────────────────────┘
```

### Executive Summary

**Data**: `summary_text` (string)

**Visual**:
```
┌───────────────────────────────────────────┐
│  📋 Executive Summary                     │
│                                           │
│  [Copy to Clipboard] [Export PDF]        │
├───────────────────────────────────────────┤
│                                           │
│  E-commerce Platform has a 35% chance    │
│  of meeting the 15-week deadline.        │
│  Expected completion is 15.5 weeks       │
│  (P50) with a worst-case of 22.3 weeks   │
│  (P90).                                   │
│                                           │
│  Key risks include scope volatility      │
│  (60/100) and team imbalance (50/100),   │
│  driven by junior team composition and   │
│  high integration complexity.            │
│                                           │
│  Estimated cost ranges from $155,000 to  │
│  $223,000.                                │
│                                           │
│  Critical recommendation: Lock scope     │
│  early to maintain schedule confidence   │
│  and consider adding one senior          │
│  developer to improve velocity.          │
│                                           │
└───────────────────────────────────────────┘
```

### Task Breakdown

**Data**: `tasks` (array of TaskItem objects)

**Visual**:
```
┌───────────────────────────────────────────┐
│  ✅ AI-Generated Task Blueprint           │
├───────────────────────────────────────────┤
│                                           │
│  1. [DevOps] Set up CI/CD pipeline       │
│     🟡 Early Validation                   │
│                                           │
│  2. [BE] Design core API endpoints        │
│     🔴 High Risk                          │
│                                           │
│  3. [BE] Build authentication system      │
│     🟠 Dependency Bottleneck              │
│                                           │
│  4. [FE] Create UI component library      │
│                                           │
│  5. [BE] Implement API integrations       │
│     🔴 High Risk                          │
│                                           │
│  ... 5 more tasks                         │
│                                           │
│  [Export to Jira] [Copy Markdown]        │
└───────────────────────────────────────────┘
```

**Color Coding for Roles**:
- **[FE]**: Blue badge
- **[BE]**: Green badge
- **[DevOps]**: Orange badge

**Risk Flag Icons**:
- 🔴 High Risk
- 🟠 Dependency Bottleneck
- 🟡 Early Validation
- (none) = Standard priority

---

## 8. What-If Scenario Comparison

**Visual for comparing baseline vs scenario**:

```
┌────────────────────────────────────────────────────────┐
│  🔄 What-If Analysis                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Scenario: Add 1 Senior Developer                     │
│                                                        │
│  ┌──────────────┐              ┌──────────────┐       │
│  │  BASELINE    │              │  SCENARIO    │       │
│  ├──────────────┤              ├──────────────┤       │
│  │ On-time: 45% │  ────────▶  │ On-time: 62% │ ✓     │
│  │ P50: 16.8w   │              │ P50: 14.2w   │ ✓     │
│  │ P90: 23.9w   │              │ P90: 19.1w   │ ✓     │
│  │ Cost: $588K  │              │ Cost: $655K  │ ⚠️     │
│  │ Stress: 67   │              │ Stress: 48   │ ✓     │
│  └──────────────┘              └──────────────┘       │
│                                                        │
│  Impact: +17% on-time chance, -20% stress             │
│  Cost: +$67K (+11%)                                    │
│                                                        │
│  Recommendation: ✅ Worth the investment               │
└────────────────────────────────────────────────────────┘
```

**Interactive Controls**:
```
┌─────────────────────────────────┐
│  Modify Scenario:               │
│                                 │
│  Senior Devs:  [1] → [2]  (+1) │
│  Deadline:     [12w] (no change)│
│  Integrations: [3] (no change)  │
│                                 │
│  [Run Comparison]               │
└─────────────────────────────────┘
```

---

## 9. Loading & Empty States

### Loading State (During Simulation)

```
┌─────────────────────────────────┐
│                                 │
│         ⏳ Running              │
│    Monte Carlo Simulation       │
│                                 │
│  ████████████░░░░░░  75%       │
│                                 │
│  Analyzing 1000 scenarios...    │
│                                 │
└─────────────────────────────────┘
```

### Empty State (No Results Yet)

```
┌─────────────────────────────────┐
│                                 │
│         📊                      │
│                                 │
│  Fill in project details and    │
│  click "Run Simulation" to      │
│  see your predictive timeline   │
│                                 │
└─────────────────────────────────┘
```

---

## 10. Mobile Responsive Considerations

### Stacking Order (Mobile)

```
1. Key metrics (on-time %, P50, P90) - Cards
2. Timeline chart (scrollable if needed)
3. Risk scores - Grid (2x2)
4. Cost range - Bar
5. Stress gauge - Compact
6. Role allocation - Horizontal bar
7. AI insights - Collapsible accordions
```

### Compact Views

**Risk Cards (Mobile)**:
```
┌────────────────┐
│ Integration: 45│
│ ████████░░░░   │
└────────────────┘
```

**Timeline Chart (Mobile)**:
- Make scrollable horizontally
- Show P50/P90 labels at top
- Simplify to line chart if needed

---

## Color Palette Recommendations

### Primary Colors
- **Blue** (#3B82F6): P50, Frontend, Info
- **Red** (#EF4444): P90, High Risk, Critical
- **Green** (#10B981): Success, Backend, On-track
- **Orange** (#FB923C): DevOps, Warning
- **Yellow** (#F59E0B): Medium Risk, Caution

### Status Colors
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Yellow/Orange)
- **Danger**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)
- **Neutral**: #6B7280 (Gray)

### Background/UI
- **Background**: #F9FAFB (Light gray)
- **Cards**: #FFFFFF (White)
- **Borders**: #E5E7EB (Light gray)
- **Text**: #111827 (Dark gray)

---

## Animation Recommendations

### Chart Transitions
- Histogram bars: Grow from bottom (300ms ease-out)
- Risk radar: Fade in + scale (400ms ease-out)
- Gauges: Sweep animation (500ms ease-out)
- Numbers: Count up effect (1000ms)

### What-If Comparisons
- Morph between baseline and scenario charts (600ms)
- Highlight changed values with subtle pulse
- Slide in comparison view from right

### Loading States
- Skeleton screens for charts (shimmer effect)
- Progress bar with percentage
- Fade in results when ready

---

## Accessibility Considerations

1. **Color Contrast**: All text meets WCAG AA (4.5:1 ratio)
2. **Screen Readers**: Label all charts with `aria-label`
3. **Keyboard Navigation**: All interactive elements tabbable
4. **Focus Indicators**: Visible focus rings
5. **Alternative Text**: Describe charts in `alt` or `aria-describedby`

**Example**:
```html
<div 
  role="img" 
  aria-label="Timeline distribution showing 45% on-time probability, with P50 at 16.8 weeks and P90 at 23.9 weeks"
>
  <!-- Chart component -->
</div>
```

---

## Testing Your Visualizations

### Visual Regression Testing

Test with these scenarios:

1. **Perfect Project**: High on-time %, low risk, low stress
2. **Risky Project**: Low on-time %, high risk, high stress
3. **Edge Cases**: Zero team, impossible deadline, etc.
4. **Large Numbers**: Very long timelines (50+ weeks), high costs

### Example Test Data

**Scenario 1: "Dream Project"**
```json
{
  "on_time_probability": 0.92,
  "p50_weeks": 6.2,
  "p90_weeks": 7.8,
  "team_stress_index": 25,
  "risk_scores": {
    "integration": 15,
    "team_imbalance": 10,
    "scope_creep": 20,
    "learning_curve": 12
  }
}
```

**Scenario 2: "Nightmare Project"**
```json
{
  "on_time_probability": 0.02,
  "p50_weeks": 47.3,
  "p90_weeks": 71.8,
  "team_stress_index": 92,
  "risk_scores": {
    "integration": 85,
    "team_imbalance": 78,
    "scope_creep": 90,
    "learning_curve": 72
  }
}
```

---

**For implementation questions or custom visualizations, refer to the main [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)**
