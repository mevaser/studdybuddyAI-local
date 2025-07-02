// Enhanced lecturer-report.js with question clustering and improved visualizations

// Question similarity and clustering algorithms
class QuestionAnalyzer {
  constructor() {
    this.stopWords = new Set([
      "how",
      "what",
      "when",
      "where",
      "why",
      "who",
      "which",
      "whose",
      "whom",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "can",
      "may",
      "might",
      "must",
      "to",
      "of",
      "for",
      "with",
      "by",
      "from",
      "as",
      "at",
      "on",
      "in",
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "not",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "its",
      "our",
      "their",
    ]);
  }

  // Tokenize and normalize text
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word));
  }

  // Calculate Jaccard similarity between two sets of tokens
  jaccardSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  // Calculate cosine similarity using term frequency
  cosineSimilarity(tokens1, tokens2) {
    const allTokens = [...new Set([...tokens1, ...tokens2])];
    const vector1 = allTokens.map(
      (token) => tokens1.filter((t) => t === token).length
    );
    const vector2 = allTokens.map(
      (token) => tokens2.filter((t) => t === token).length
    );

    const dotProduct = vector1.reduce(
      (sum, val, i) => sum + val * vector2[i],
      0
    );
    const magnitude1 = Math.sqrt(
      vector1.reduce((sum, val) => sum + val * val, 0)
    );
    const magnitude2 = Math.sqrt(
      vector2.reduce((sum, val) => sum + val * val, 0)
    );

    return magnitude1 && magnitude2
      ? dotProduct / (magnitude1 * magnitude2)
      : 0;
  }

  // Advanced semantic similarity using n-grams and weighted features
  semanticSimilarity(text1, text2) {
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);

    // Basic token similarity
    const tokenSim = this.cosineSimilarity(tokens1, tokens2);

    // Bigram similarity
    const bigrams1 = this.generateNGrams(tokens1, 2);
    const bigrams2 = this.generateNGrams(tokens2, 2);
    const bigramSim = this.jaccardSimilarity(bigrams1, bigrams2);

    // Length similarity factor
    const lengthSim =
      1 -
      Math.abs(tokens1.length - tokens2.length) /
        Math.max(tokens1.length, tokens2.length);

    // Weighted combination
    return tokenSim * 0.5 + bigramSim * 0.3 + lengthSim * 0.2;
  }

  // Generate n-grams from tokens
  generateNGrams(tokens, n) {
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
    return ngrams;
  }

  // Cluster similar questions using hierarchical clustering
  clusterQuestions(questions, threshold = 0.7) {
    const clusters = [];
    const processed = new Set();

    questions.forEach((question, index) => {
      if (processed.has(index)) return;

      const cluster = {
        representative: question,
        questions: [question],
        indices: [index],
        totalCount: question.count || 1,
      };

      // Find similar questions
      questions.forEach((otherQuestion, otherIndex) => {
        if (index !== otherIndex && !processed.has(otherIndex)) {
          const similarity = this.semanticSimilarity(
            question.question,
            otherQuestion.question
          );

          if (similarity >= threshold) {
            cluster.questions.push(otherQuestion);
            cluster.indices.push(otherIndex);
            cluster.totalCount += otherQuestion.count || 1;
            processed.add(otherIndex);
          }
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    // Sort clusters by total count (most frequent first)
    return clusters.sort((a, b) => b.totalCount - a.totalCount);
  }

  // Get cluster statistics
  getClusterStats(originalQuestions, clusters) {
    const totalOriginal = originalQuestions.length;
    const totalClusters = clusters.length;
    const duplicatesFound = totalOriginal - totalClusters;
    const reductionPercent = Math.round(
      (duplicatesFound / totalOriginal) * 100
    );

    return {
      totalOriginal,
      totalClusters,
      duplicatesFound,
      reductionPercent,
    };
  }
}

// Enhanced chart creation utilities
class ChartGenerator {
  static createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  }

  static getModernColors() {
    return [
      ["#FF6B6B", "#FF8E8E"],
      ["#4ECDC4", "#44B3AC"],
      ["#45B7D1", "#5DADE2"],
      ["#96CEB4", "#A8D8C8"],
      ["#FFEAA7", "#FDCB6E"],
      ["#DDA0DD", "#E6B3E6"],
      ["#98D8C8", "#A8E6CF"],
      ["#F7DC6F", "#F8C471"],
    ];
  }

  static createBarChart(ctx, data, title, options = {}) {
    const colors = this.getModernColors();

    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            label: title,
            data: data.map((item) => item.count),
            backgroundColor: data.map((_, index) =>
              this.createGradient(
                ctx,
                colors[index % colors.length][0],
                colors[index % colors.length][1]
              )
            ),
            borderColor: data.map(
              (_, index) => colors[index % colors.length][0]
            ),
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0,0,0,0.1)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        ...options,
      },
    });
  }

  static createDoughnutChart(ctx, data, title) {
    const colors = this.getModernColors();

    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            data: data.map((item) => item.count),
            backgroundColor: data.map(
              (_, index) => colors[index % colors.length][0]
            ),
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
      },
    });
  }
}

// Enhanced PDF generation with improved layouts (with Hebrew font support)
async function loadJsPDF() {
  if (window.jsPDF) return window.jsPDF;

  // 1) Load the jsPDF library
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        window.jsPDF = window.jspdf.jsPDF;
        resolve();
      } else {
        reject(new Error("jsPDF object not found"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });

  // 2) Embed Alef-Regular.ttf into jsPDF's VFS
  //    (paste here the Base64 string from alef-regular.b64.txt)
  window.jsPDF.API.addFileToVFS(
    "Alef-Regular.ttf",
    "<PASTE_BASE64_FROM_alef-bold.b64.txt>"
  );
  //    register it under the family name "Alef", style "normal"
  window.jsPDF.API.addFont("Alef-Regular.ttf", "Alef", "normal");

  // 3) Embed Alef-Bold.ttf into jsPDF's VFS
  //    (paste here the Base64 string from alef-bold.b64.txt)
  window.jsPDF.API.addFileToVFS(
    "Alef-Bold.ttf",
    "<PASTE_BASE64_FROM_alef-bold.b64.txt>"
  );
  //    register it under the family name "Alef", style "bold"
  window.jsPDF.API.addFont("Alef-Bold.ttf", "Alef", "bold");

  return window.jsPDF;
}

function checkPageOverflow(doc, currentY, threshold = 270) {
  if (currentY > threshold) {
    doc.addPage();
    return 15; // Reset top margin for new page
  }
  return currentY;
}

function drawEnhancedBarChart(doc, data, title, startY, maxWidth = 150) {
  const barHeight = 8;
  const barSpacing = 6;
  const chartLeft = 20;
  const maxCount = Math.max(...data.map((d) => d.count));
  const scale = maxWidth / (maxCount || 1);

  let y = startY;
  y = checkPageOverflow(doc, y);

  // Title with underline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, chartLeft, y);
  doc.setLineWidth(0.5);
  doc.line(chartLeft, y + 2, chartLeft + doc.getTextWidth(title), y + 2);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  data.forEach(({ label, count }, index) => {
    y = checkPageOverflow(doc, y);

    // Gradient-like effect with multiple rectangles
    const colors = [
      [100, 149, 237],
      [255, 99, 132],
      [255, 206, 86],
      [75, 192, 192],
      [153, 102, 255],
      [255, 159, 64],
    ];

    const color = colors[index % colors.length];
    doc.setFillColor(color[0], color[1], color[2]);

    // Main bar
    const barWidth = count * scale;
    doc.rect(chartLeft + 70, y - 2, barWidth, barHeight, "F");

    // Highlight effect
    doc.setFillColor(255, 255, 255);
    doc.rect(chartLeft + 70, y - 2, barWidth, 2, "F");

    // Label and count
    doc.setTextColor(0, 0, 0);
    doc.text(label, chartLeft, y + 3);
    doc.setFont("helvetica", "bold");
    doc.text(`${count}`, chartLeft + 75 + barWidth, y + 3);
    doc.setFont("helvetica", "normal");

    y += barHeight + barSpacing;
  });

  return y + 10;
}

function drawClusterSummary(doc, clusters, startY) {
  let y = startY;
  y = checkPageOverflow(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Question Clustering Analysis", 20, y);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 120, y + 2);
  y += 15;

  // Summary statistics
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const stats = new QuestionAnalyzer().getClusterStats(
    clusters.reduce((acc, cluster) => [...acc, ...cluster.questions], []),
    clusters
  );

  doc.text(`Total Question Clusters: ${stats.totalClusters}`, 20, y);
  y += 8;
  doc.text(`Duplicates Identified: ${stats.duplicatesFound}`, 20, y);
  y += 8;
  doc.text(`Reduction Achieved: ${stats.reductionPercent}%`, 20, y);
  y += 15;

  // Top clusters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Top Question Clusters:", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  clusters.slice(0, 5).forEach((cluster, index) => {
    y = checkPageOverflow(doc, y);

    // Cluster header
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. Cluster (${cluster.totalCount} questions):`, 20, y);
    y += 6;

    // Representative question
    doc.setFont("helvetica", "normal");
    const repLines = doc.splitTextToSize(
      `"${cluster.representative.question}"`,
      160
    );
    repLines.forEach((line) => {
      y = checkPageOverflow(doc, y);
      doc.text(line, 25, y);
      y += 5;
    });

    // Similar questions (if more than 1)
    if (cluster.questions.length > 1) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`+ ${cluster.questions.length - 1} similar questions`, 25, y);
      y += 5;
      doc.setFontSize(10);
    }

    y += 5;
  });

  return y + 10;
}

function drawVisualizationSummary(doc, data, startY) {
  let y = startY;
  y = checkPageOverflow(doc, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Data Visualization Summary", 20, y);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 130, y + 2);
  y += 15;

  // Create mini charts representation
  if (data.topTopicsPerCourse) {
    Object.entries(data.topTopicsPerCourse).forEach(([course, topics]) => {
      y = checkPageOverflow(doc, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${course} - Topic Distribution:`, 20, y);
      y += 8;

      // Simple bar representation
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      topics.slice(0, 3).forEach(([topic, count]) => {
        const barWidth = Math.min(count * 2, 50);
        doc.setFillColor(100, 149, 237);
        doc.rect(25, y - 3, barWidth, 4, "F");
        doc.text(`${topic}: ${count}`, 80, y);
        y += 7;
      });

      y += 5;
    });
  }

  return y + 10;
}

// Main enhanced report generation
document.addEventListener("DOMContentLoaded", () => {
  const lecturerLink = document.getElementById("lecturerReportLink");
  const modal = document.getElementById("lecturerReportModal");
  const cancelBtn = document.getElementById("cancelReportBtn");
  const generateBtn = document.getElementById("generateReportBtn");

  if (!(lecturerLink && modal && cancelBtn && generateBtn)) return;

  // Initialize question analyzer
  const questionAnalyzer = new QuestionAnalyzer();

  lecturerLink.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  generateBtn.addEventListener("click", async () => {
    const startDate = document.getElementById("reportStartDate").value;
    const endDate = document.getElementById("reportEndDate").value;

    if (!startDate || !endDate) {
      return alert("Please select both start and end dates");
    }
    if (startDate > endDate) {
      return alert("Start date cannot be after end date");
    }

    const payload = {
      startDate,
      endDate,
      includeTop5: document.getElementById("includeTop5").checked,
      includeInactive: document.getElementById("includeInactive").checked,
      includeRecommendations: document.getElementById("includeRecommendations")
        .checked,
      includeQuestionClustering: true, // New feature
      similarityThreshold: 0.7, // Configurable threshold
    };

    try {
      generateBtn.textContent = "Generating Report...";
      generateBtn.disabled = true;

      const response = await fetch(
        "https://18ygiad1a8.execute-api.us-east-1.amazonaws.com/dev/LecturerReport",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let result = await response.json();
      if (typeof result.body === "string") {
        result = JSON.parse(result.body);
      }

      if (!response.ok) {
        return alert(`Server Error: ${response.status}`);
      }

      // Process question clustering if frequent questions exist
      let questionClusters = [];
      if (result.frequentQuestions && result.frequentQuestions.length > 0) {
        console.log("Processing question clustering...");
        questionClusters = questionAnalyzer.clusterQuestions(
          result.frequentQuestions,
          payload.similarityThreshold
        );
        console.log(`Created ${questionClusters.length} question clusters`);
      }

      // Generate enhanced PDF
      const jsPDF = await loadJsPDF();
      const doc = new jsPDF();
      let y = 15;

      // Enhanced header
      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.text("ENHANCED LECTURER REPORT", 105, y, { align: "center" });
      y += 8;

      doc.setFontSize(14);
      doc.text("Student Question Analysis & Insights", 105, y, {
        align: "center",
      });
      y += 15;

      // Date range
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(
        `Report Period: ${result.range?.start || "N/A"} to ${
          result.range?.end || "N/A"
        }`,
        105,
        y,
        { align: "center" }
      );
      y += 15;

      // Executive Summary Box
      doc.setDrawColor(100, 149, 237);
      doc.setLineWidth(1);
      doc.rect(15, y, 180, 25);
      doc.setFillColor(240, 248, 255);
      doc.rect(15, y, 180, 25, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Executive Summary", 20, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const totalQuestions = result.frequentQuestions?.length || 0;
      const totalClusters = questionClusters.length;
      const reductionPercent =
        totalQuestions > 0
          ? Math.round(
              ((totalQuestions - totalClusters) / totalQuestions) * 100
            )
          : 0;

      doc.text(`Total Questions Analyzed: ${totalQuestions}`, 20, y + 15);
      doc.text(`Question Clusters Identified: ${totalClusters}`, 20, y + 20);
      doc.text(`Duplicate Reduction: ${reductionPercent}%`, 120, y + 15);
      doc.text(`Active Students: ${result.top5?.length || 0}`, 120, y + 20);

      y += 35;

      // Top 5 Active Students
      if (result.top5?.length) {
        y = drawEnhancedBarChart(
          doc,
          result.top5.map((u) => ({
            label: u.name || u.email?.split("@")[0] || "Unknown",
            count: u.count,
          })),
          "📊 Top 5 Most Active Students",
          y
        );
      }

      // Course-specific topic analysis
      if (result.topTopicsPerCourse?.["C#"]) {
        y = drawEnhancedBarChart(
          doc,
          result.topTopicsPerCourse["C#"].map(([label, count]) => ({
            label,
            count,
          })),
          "💻 Top Topics in C# Programming",
          y
        );
      }

      if (result.topTopicsPerCourse?.Networking) {
        y = drawEnhancedBarChart(
          doc,
          result.topTopicsPerCourse["Networking"].map(([label, count]) => ({
            label,
            count,
          })),
          "🌐 Top Topics in Networking",
          y
        );
      }

      // Question clustering analysis
      if (questionClusters.length > 0) {
        y = drawClusterSummary(doc, questionClusters, y);
      }

      // Visualization summary
      if (result.topTopicsPerCourse) {
        y = drawVisualizationSummary(doc, result, y);
      }

      // Enhanced recommendations
      if (result.recommendations) {
        y = checkPageOverflow(doc, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("🎯 Lecturer Recommendations", 20, y);
        doc.setLineWidth(0.5);
        doc.line(20, y + 2, 120, y + 2);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(result.recommendations.trim(), 170);
        lines.forEach((line) => {
          y = checkPageOverflow(doc, y);
          doc.text(line, 20, y);
          y += 7;
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
          105,
          290,
          { align: "center" }
        );
      }

      // Save the enhanced report
      doc.save(`enhanced-lecturer-report-${startDate}-${endDate}.pdf`);
      modal.style.display = "none";

      // Show success message
      alert(
        `Enhanced report generated successfully!\nQuestion clusters: ${totalClusters}\nDuplicate reduction: ${reductionPercent}%`
      );
    } catch (err) {
      console.error("❌ Error generating report:", err);
      alert(
        "Error generating enhanced report. Please check console for details."
      );
    } finally {
      generateBtn.textContent = "Generate Enhanced Report";
      generateBtn.disabled = false;
    }
  });
});

// Export classes for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { QuestionAnalyzer, ChartGenerator };
}
