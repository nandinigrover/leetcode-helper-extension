// --- DOM helpers -----------------------------------------------------------

function applyStyles(el, styles) {
    Object.assign(el.style, styles);
  }
  
  function createElement(tag, styles = {}, attrs = {}) {
    const el = document.createElement(tag);
    applyStyles(el, styles);
    Object.assign(el, attrs);
    return el;
  }
  
  function removeById(id) {
    document.getElementById(id)?.remove();
  }
  
  // --- Global styles ---------------------------------------------------------
  
  function injectGlobalStyles() {
    if (document.getElementById("lc-helper-styles")) return;
  
    const style = document.createElement("style");
    style.id = "lc-helper-styles";
    style.textContent = `
      @keyframes lch-slideIn {
        from { opacity: 0; transform: translateX(16px) scale(0.98); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }
  
      @keyframes lch-hintIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
  
      #leetcode-helper-panel {
        animation: lch-slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
  
      #leetcode-helper-panel::-webkit-scrollbar { width: 4px; }
      #leetcode-helper-panel::-webkit-scrollbar-track { background: transparent; }
      #leetcode-helper-panel::-webkit-scrollbar-thumb {
        background: #3a3a50;
        border-radius: 4px;
      }
  
      .lch-hint-card {
        animation: lch-hintIn 0.2s ease both;
      }
  
      #leetcode-helper-btn {
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease !important;
      }
  
      #leetcode-helper-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(255, 161, 22, 0.45) !important;
      }
  
      #leetcode-helper-btn:active {
        transform: translateY(0px) !important;
      }
  
      .lch-next-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #ffb340, #ff8c00) !important;
      }
  
      .lch-next-btn:active:not(:disabled) {
        transform: scale(0.97);
      }
  
      .lch-close-btn:hover {
        background: rgba(255,255,255,0.1) !important;
        color: #fff !important;
      }
    `;
  
    document.head.appendChild(style);
  }
  
  // --- Problem extraction ----------------------------------------------------
  
  function extractProblemTitle() {
    const el =
      document.querySelector("div.text-title-large") ||
      document.querySelector("h1");
  
    return el ? el.textContent.trim() : "Unknown Problem";
  }
  
  function extractProblemDescription() {
    const candidates = [
      document.querySelector('[data-track-load="description_content"]'),
      document.querySelector("article"),
      document.querySelector(".elfjS"),
      document.querySelector('[class*="description"]')
    ];
  
    for (const el of candidates) {
      if (el && el.textContent.trim().length > 100) {
        return el.textContent.trim();
      }
    }
  
    return "";
  }
  
  // --- Hint generation -------------------------------------------------------

  // Keywords are matched against title (2× weight) and description (1× weight).
  // All matching uses text.includes(), so:
  //   - multi-word phrases are naturally specific
  //   - single-word keywords must be uncommon enough not to cause false positives
  //   - intentional fragments (e.g. "parenthes") catch singular and plural forms
  const PATTERN_RULES = [
    {
      name: "Stack",
      keywords: [
        "stack",                 // Min Stack, Implement Stack Using Queues
        "parenthes",             // fragment: matches "parenthesis" and "parentheses"
        "brackets",
        "monotonic",
        "next greater",          // Next Greater Element I / II
        "daily temperature",
        "histogram",             // Largest Rectangle in Histogram
        "reverse polish",        // Evaluate Reverse Polish Notation
        "decode string",
        "asteroid",              // Asteroid Collision
        "calculator"             // Basic Calculator I / II
      ],
      minScore: 2,
      hints: [
        "A stack naturally handles 'last opened, first closed' and 'most recently seen' relationships.",
        "Push when you encounter an opening element; pop and verify on a closing one.",
        "Monotonic stacks efficiently find the next greater or smaller element for every position."
      ]
    },
    {
      name: "Intervals",
      keywords: [
        "interval",              // any interval problem — specific enough on its own
        "overlap",
        "non-overlapping",
        "meeting room",
        "insert interval",
        "merge interval",
        "schedule",
        "appointment",
        "timeline"
      ],
      minScore: 2,
      hints: [
        "Sort intervals by start time first — it makes detecting and merging overlaps straightforward.",
        "Two intervals [a, b] and [c, d] overlap when c ≤ b. Merge by extending b to max(b, d).",
        "Think about what state you need to carry forward as you sweep across the sorted intervals."
      ]
    },
    {
      name: "Hash Map",
      keywords: [
        "two sum",               // Two Sum
        "anagram",               // Valid Anagram, Group Anagrams
        "frequency",
        "occurrence",
        "duplicate",             // Contains Duplicate
        "complement",
        "group anagram",
        "word count",
        "character count",
        "first missing",         // First Missing Positive
        "isomorphic",            // Isomorphic Strings
        "word pattern",          // Word Pattern
        "roman"                  // Roman to Integer (lookup table)
      ],
      minScore: 2,
      hints: [
        "A hash map gives O(1) lookup — ask whether checking a stored value could replace a nested loop.",
        "Think carefully about what to use as the key and what to store as the value.",
        "A single pass while recording what you've seen is often all that's needed."
      ]
    },
    {
      name: "Two Pointers",
      keywords: [
        "palindrome",
        "reverse",
        "in-place",
        "remove duplicate",      // Remove Duplicates from Sorted Array
        "container with water",  // Container With Most Water
        "trap rain water",       // Trapping Rain Water
        "three sum",             // 3Sum
        "two sum ii",            // Two Sum II (sorted input → two pointers)
        "sorted array",
        "move zeroes",           // Move Zeroes
        "sort colors",           // Sort Colors (Dutch national flag)
        "valid palindrome"
      ],
      minScore: 2,
      hints: [
        "Try starting one pointer at each end and moving inward based on a condition.",
        "Ask what moving the left pointer guarantees versus moving the right — that's your invariant.",
        "Two pointers often reduce an O(n²) brute-force search into a single O(n) pass."
      ]
    },
    {
      name: "Sliding Window",
      keywords: [
        "sliding window",
        "longest substring",     // Longest Substring Without Repeating Characters
        "longest subarray",
        "minimum window",        // Minimum Window Substring
        "contiguous subarray",
        "maximum sum subarray",
        "at most k",
        "exactly k",
        "without repeating",
        "subarray of size k",
        "maximum average",       // Maximum Average Subarray
        "fruit into basket",     // Fruit Into Baskets
        "permutation in string"  // Permutation in String
      ],
      minScore: 2,
      hints: [
        "Expand the right edge greedily; shrink the left edge when a constraint is violated.",
        "What condition makes the window invalid? That's your signal to move the left pointer.",
        "Maintain state incrementally as the window slides — avoid recomputing from scratch each step."
      ]
    },
    {
      name: "Prefix Sum",
      keywords: [
        "subarray sum",          // Subarray Sum Equals K
        "range sum",             // Range Sum Query
        "prefix sum",
        "sum equals k",
        "sum divisible by",
        "running total",
        "cumulative sum",
        "product except self",   // Product of Array Except Self
        "pivot index"            // Find Pivot Index
      ],
      minScore: 2,
      hints: [
        "A prefix sum array makes any range-sum query answerable in O(1) after O(n) preprocessing.",
        "The sum from index i to j is prefix[j + 1] − prefix[i].",
        "Storing prefix sums in a hash map lets you find subarrays summing to a target in one pass."
      ]
    },
    {
      name: "Binary Search",
      keywords: [
        "binary search",
        "rotated sorted",        // Search in Rotated Sorted Array
        "search in sorted",
        "find minimum in rotated",
        "find peak element",     // Find Peak Element
        "kth smallest",          // Kth Smallest Element in a BST
        "kth largest",           // Kth Largest Element in an Array
        "minimum days",          // Minimum Number of Days to Make m Bouquets
        "capacity to ship",      // Capacity To Ship Packages Within D Days
        "split array",           // Split Array Largest Sum
        "maximum of minimum",
        "minimum of maximum",
        "allocate",              // Allocate Books / Painter's Partition
        "median of two sorted",  // Median of Two Sorted Arrays
        "search a 2d matrix"     // Search a 2D Matrix
      ],
      minScore: 2,
      hints: [
        "If the search space is monotonic, you can eliminate half of it on every step.",
        "Clearly define your loop invariant: what does the left boundary guarantee? The right?",
        "Consider binary searching on the answer value itself, not just an array index."
      ]
    },
    {
      name: "DFS",
      // "tree" and "graph" are intentionally absent — too broad and cause false positives
      // (e.g. "Binary Tree Level Order Traversal" should be BFS only).
      // Instead, use problem-specific phrases that imply depth-first exploration.
      keywords: [
        "number of island",      // Number of Islands (fragment matches "islands")
        "connected component",
        "path sum",              // Path Sum I / II / III, Binary Tree Maximum Path Sum
        "all paths",             // All Paths From Source to Target
        "root to leaf",          // Root to Leaf paths
        "flood fill",            // Flood Fill
        "word search",           // Word Search I / II
        "detect cycle",          // Detect Cycle (avoids misfiring on "Linked List Cycle")
        "course schedule",       // Course Schedule I / II (topological DFS)
        "clone",                 // Clone Graph
        "inorder",               // Inorder Traversal
        "preorder",              // Preorder Traversal
        "postorder",             // Postorder Traversal
        "serialize",             // Serialize and Deserialize Binary Tree
        "deserialize",
        "lowest common ancestor",
        "diameter",              // Diameter of Binary Tree
        "max depth",             // Maximum Depth of Binary Tree (short form)
        "maximum depth",
        "minimum depth",
        "subtree",               // Subtree of Another Tree, Balanced Binary Tree
        "flatten",               // Flatten Binary Tree to Linked List
        "pacific atlantic",      // Pacific Atlantic Water Flow
        "surrounded region",     // Surrounded Regions (fragment matches "regions")
        "redundant connection"   // Redundant Connection
      ],
      minScore: 2,
      hints: [
        "DFS explores as deep as possible before backtracking — well suited for path and connectivity problems.",
        "A recursive approach is natural; swap in an explicit stack if you need to avoid recursion depth limits.",
        "Mark nodes visited before recursing into them to avoid infinite loops in graph problems."
      ]
    },
    {
      name: "BFS",
      keywords: [
        "level order",           // Binary Tree Level Order Traversal (and variants)
        "shortest path",
        "minimum steps",
        "minimum distance",
        "minimum moves",
        "word ladder",           // Word Ladder I / II
        "rotten orange",         // fragment matches both "rotten oranges" and "rotting oranges"
        "rotting orange",        // explicit match for "Rotting Oranges" title
        "0-1 matrix",
        "nearest cell",
        "walls and gates",
        "minimum mutation",      // Minimum Genetic Mutation
        "open lock",             // Open the Lock
        "shortest bridge",       // Shortest Bridge
        "as far from land",      // As Far from Land as Possible
        "network delay",         // Network Delay Time
        "cheapest flight"        // Cheapest Flights Within K Stops
      ],
      minScore: 2,
      hints: [
        "BFS visits nodes level by level, guaranteeing the shortest path in an unweighted graph.",
        "Enqueue a node the moment you first see it — not when you process it — to avoid re-enqueuing.",
        "Keep a visited set or distance array so each node is processed at most once."
      ]
    },
    {
      name: "Dynamic Programming",
      keywords: [
        "number of ways",
        "count ways",
        "minimum cost",
        "maximum profit",
        "longest increasing subsequence",
        "longest common subsequence",
        "edit distance",         // Edit Distance
        "coin change",           // Coin Change I / II
        "house robber",          // House Robber I / II / III
        "climbing stair",        // Climbing Stairs (fragment matches "stairs")
        "knapsack",
        "partition equal",       // Partition Equal Subset Sum
        "wildcard matching",     // Wildcard Matching
        "palindromic subsequence",
        "maximum subarray",      // Maximum Subarray (Kadane's)
        "unique path",           // Unique Paths I / II (fragment matches "paths")
        "decode ways",           // Decode Ways
        "buy and sell stock",    // Best Time to Buy and Sell Stock
        "word break",            // Word Break
        "target sum",            // Target Sum
        "jump game",             // Jump Game I / II
        "minimum path sum",      // Minimum Path Sum
        "triangle",              // Triangle
        "perfect square",        // Perfect Squares (fragment matches "squares")
        "integer break",         // Integer Break
        "paint house",           // Paint House
        "regular expression",    // Regular Expression Matching
        "interleaving string"    // Interleaving String
      ],
      minScore: 2,
      hints: [
        "Ask whether you are solving the same subproblem more than once — that's the DP signal.",
        "Define your state: what is the minimum information you need to compute the answer from here?",
        "Write the recurrence relation first, then decide between top-down memoisation and bottom-up tabulation."
      ]
    },
    {
      name: "Backtracking",
      keywords: [
        "combination sum",       // Combination Sum I / II / III
        "all combinations",
        "permutation",           // Permutations I / II (fragment matches both forms)
        "subset",                // Subsets I / II (fragment matches "subsets")
        "generate parentheses",  // Generate Parentheses
        "word search",           // Word Search I / II (also DFS — both correct)
        "n-queens",              // N-Queens I / II
        "sudoku solver",         // Sudoku Solver
        "letter combination",    // Letter Combinations of a Phone Number
        "restore ip",            // Restore IP Addresses
        "palindrome partition",  // Palindrome Partitioning
        "beautiful arrangement"  // Beautiful Arrangement
      ],
      minScore: 2,
      hints: [
        "Build the candidate solution one element at a time, trying every valid option at each step.",
        "Prune early: if the partial solution already violates a constraint, backtrack immediately.",
        "Your recursive function makes a choice, recurses with it, then undoes the choice before trying the next."
      ]
    },
    {
      name: "Linked List",
      keywords: [
        "linked list",           // any linked list problem
        "list node",
        "reverse linked list",   // Reverse Linked List I / II
        "merge two list",        // Merge Two Sorted Lists (fragment matches "lists")
        "reorder list",          // Reorder List
        "remove nth node",       // Remove Nth Node From End of List
        "detect cycle",          // Linked List Cycle I / II
        "intersection of",       // Intersection of Two Linked Lists
        "add two number",        // Add Two Numbers (fragment matches "numbers")
        "middle of",             // Middle of the Linked List
        "swap node",             // Swap Nodes in Pairs
        "rotate list",           // Rotate List
        "odd even list"          // Odd Even Linked List
      ],
      minScore: 2,
      hints: [
        "Draw the before-and-after pointer state on paper before writing a single line of code.",
        "Slow and fast pointers handle cycle detection and midpoint finding elegantly in one pass.",
        "Be precise about update order — changing one pointer too early often corrupts the rest of the list."
      ]
    }
  ];

  // Uses text.includes() for all keywords — both single words and phrases.
  function countMatches(text, keywords) {
    let count = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) count++;
    }
    return count;
  }

  function generateHints(title, description) {
    const titleText = title.toLowerCase();
    const descText  = description.toLowerCase();

    const defaultHints = [
      "Start with the smallest concrete example and trace through it by hand.",
      "What information do you need to carry forward as you move through the input?",
      "Check edge cases: empty input, a single element, all duplicates."
    ];

    const matched = [];

    for (const rule of PATTERN_RULES) {
      // Title is scored separately at 2× weight — it's the densest, most reliable signal.
      // Scoring separately avoids double-counting keywords that appear in both.
      const titleScore = countMatches(titleText, rule.keywords) * 2;
      const descScore  = countMatches(descText,  rule.keywords);
      const score = titleScore + descScore;

      if (score >= rule.minScore) {
        matched.push({ name: rule.name, score, hints: rule.hints });
      }
    }

    matched.sort((a, b) => b.score - a.score);

    const patterns = matched.map((m) => m.name);
    const hints    = matched.length > 0 ? matched[0].hints : defaultHints;

    return { patterns, hints };
  }
  
  // --- UI components ---------------------------------------------------------
  
  const CHIP_PALETTE = [
    { bg: "rgba(255,161,22,0.12)", text: "#ffa116", border: "rgba(255,161,22,0.3)" },
    { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
    { bg: "rgba(52,211,153,0.12)", text: "#34d399", border: "rgba(52,211,153,0.3)" },
    { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    { bg: "rgba(244,114,182,0.12)", text: "#f472b6", border: "rgba(244,114,182,0.3)" },
    { bg: "rgba(251,146,60,0.12)", text: "#fb923c", border: "rgba(251,146,60,0.3)" }
  ];
  
  const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  
  function createPatternChip(label, index) {
    const { bg, text, border } = CHIP_PALETTE[index % CHIP_PALETTE.length];
  
    const chip = createElement("span", {
      display: "inline-block",
      padding: "3px 10px",
      marginRight: "6px",
      marginBottom: "6px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      fontFamily: FONT,
      letterSpacing: "0.02em",
      background: bg,
      color: text,
      border: `1px solid ${border}`
    });
  
    chip.textContent = label;
    return chip;
  }
  
  function createHintCard(index, text) {
    const card = createElement("div", {
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
      padding: "12px 14px",
      marginTop: "10px",
      background: "rgba(255,161,22,0.06)",
      border: "1px solid rgba(255,161,22,0.18)",
      borderRadius: "10px",
      borderLeft: "3px solid #ffa116"
    });
  
    card.className = "lch-hint-card";
  
    const badge = createElement("span", {
      flexShrink: "0",
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "rgba(255,161,22,0.2)",
      color: "#ffa116",
      fontSize: "11px",
      fontWeight: "700",
      fontFamily: FONT,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: "1"
    });
  
    badge.textContent = index + 1;
  
    const body = createElement("p", {
      margin: "0",
      fontSize: "13px",
      lineHeight: "1.55",
      color: "rgba(255,255,255,0.82)",
      fontFamily: FONT
    });
  
    body.textContent = text;
  
    card.append(badge, body);
    return card;
  }
  
  function createPanel(title, patterns, hints) {
    let currentHintIndex = 0;
  
    const panel = createElement(
      "div",
      {
        position: "fixed",
        top: "130px",
        right: "20px",
        width: "340px",
        maxHeight: "72vh",
        overflowY: "auto",
        background: "#1c1c27",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        zIndex: "9999",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,161,22,0.08)",
        fontFamily: FONT
      },
      { id: "leetcode-helper-panel" }
    );
  
    const header = createElement("div", {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 18px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    });
  
    const headerLeft = createElement("div", {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    });
  
    const icon = createElement("span", {
      fontSize: "16px",
      lineHeight: "1"
    });
    icon.textContent = "💡";
  
    const headerTitle = createElement("span", {
      fontSize: "14px",
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: "0.01em"
    });
    headerTitle.textContent = "LeetCode Helper";
  
    headerLeft.append(icon, headerTitle);
  
    const closeBtn = createElement("button", {
      background: "transparent",
      border: "none",
      borderRadius: "6px",
      color: "rgba(255,255,255,0.45)",
      fontSize: "18px",
      lineHeight: "1",
      cursor: "pointer",
      padding: "2px 6px",
      transition: "background 0.15s, color 0.15s"
    });
  
    closeBtn.className = "lch-close-btn";
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", () => removeById("leetcode-helper-panel"));
  
    header.append(headerLeft, closeBtn);
  
    const body = createElement("div", {
      padding: "16px 18px 18px"
    });
  
    const problemLabel = createElement("p", {
      margin: "0 0 3px",
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)"
    });
    problemLabel.textContent = "Problem";
  
    const problemTitle = createElement("p", {
      margin: "0 0 16px",
      fontSize: "13px",
      fontWeight: "600",
      color: "#ffa116",
      lineHeight: "1.4"
    });
    problemTitle.textContent = title;
  
    const patternsLabel = createElement("p", {
      margin: "0 0 8px",
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)"
    });
    patternsLabel.textContent = "Patterns";
  
    const chipsRow = createElement("div", {
      marginBottom: "16px",
      lineHeight: "1"
    });
  
    if (patterns.length) {
      patterns.forEach((p, i) => chipsRow.appendChild(createPatternChip(p, i)));
    } else {
      const none = createElement("span", {
        fontSize: "12px",
        color: "rgba(255,255,255,0.35)",
        fontStyle: "italic"
      });
      none.textContent = "No strong pattern detected yet";
      chipsRow.appendChild(none);
    }
  
    const hintsLabel = createElement("p", {
      margin: "0 0 4px",
      fontSize: "10px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)"
    });
    hintsLabel.textContent = "Hints";
  
    const hintsContainer = document.createElement("div");
    hintsContainer.appendChild(createHintCard(0, hints[0]));
  
    const footer = createElement("div", {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "14px"
    });
  
    const counter = createElement("span", {
      fontSize: "12px",
      color: "rgba(255,255,255,0.35)",
      fontFamily: FONT
    });
    counter.textContent = `1 of ${hints.length}`;
  
    const nextBtn = createElement("button", {
      padding: "8px 16px",
      border: "none",
      borderRadius: "8px",
      background: "linear-gradient(135deg, #ffa116, #ff8c00)",
      color: "#000",
      fontSize: "12px",
      fontWeight: "700",
      fontFamily: FONT,
      cursor: "pointer",
      letterSpacing: "0.02em",
      transition: "background 0.15s ease, transform 0.1s ease"
    });
  
    nextBtn.className = "lch-next-btn";
    nextBtn.textContent = "Next hint →";
  
    nextBtn.addEventListener("click", () => {
      currentHintIndex++;
  
      if (currentHintIndex < hints.length) {
        hintsContainer.appendChild(createHintCard(currentHintIndex, hints[currentHintIndex]));
        counter.textContent = `${currentHintIndex + 1} of ${hints.length}`;
      }
  
      if (currentHintIndex >= hints.length - 1) {
        nextBtn.disabled = true;
        nextBtn.textContent = "All hints shown";
        nextBtn.style.background = "rgba(255,255,255,0.08)";
        nextBtn.style.color = "rgba(255,255,255,0.3)";
        nextBtn.style.cursor = "not-allowed";
      }
    });
  
    footer.append(counter, nextBtn);
  
    body.append(
      problemLabel,
      problemTitle,
      patternsLabel,
      chipsRow,
      hintsLabel,
      hintsContainer,
      footer
    );
  
    panel.append(header, body);
    return panel;
  }
  
  function createHelperButton() {
    if (document.getElementById("leetcode-helper-btn")) return;
  
    const button = createElement(
      "button",
      {
        position: "fixed",
        top: "88px",
        right: "20px",
        zIndex: "9999",
        padding: "9px 16px",
        border: "none",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #ffa116, #ff8c00)",
        color: "#000",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(255, 161, 22, 0.35)",
        fontSize: "13px",
        fontWeight: "700",
        fontFamily: FONT,
        letterSpacing: "0.02em"
      },
      { id: "leetcode-helper-btn" }
    );
  
    button.textContent = "💡 Hint";
  
    button.addEventListener("click", () => {
      const existingPanel = document.getElementById("leetcode-helper-panel");
  
      if (existingPanel) {
        existingPanel.remove();
        return;
      }
  
      const title = extractProblemTitle();
      const description = extractProblemDescription();
      const { patterns, hints } = generateHints(title, description);
  
      console.log("TITLE:", title);
      console.log("DESCRIPTION:", description);
      console.log("PATTERNS:", patterns);
      console.log("HINTS:", hints);
  
      document.body.appendChild(createPanel(title, patterns, hints));
    });
  
    document.body.appendChild(button);
  }
  
  // --- Initialisation & URL watching -----------------------------------------
  
  function initialiseExtension() {
    removeById("leetcode-helper-btn");
    removeById("leetcode-helper-panel");
    injectGlobalStyles();
    createHelperButton();
  }
  
  let lastUrl = location.href;
  
  function watchForPageChanges() {
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(initialiseExtension, 700);
      }
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  initialiseExtension();
  watchForPageChanges();