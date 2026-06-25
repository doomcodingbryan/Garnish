import { computeUgcScore } from "../src/lib/scoring/score";
import type { PlatformScoreInput } from "../src/lib/scoring/types";

let failures = 0;
function check(name: string, cond: boolean, detail: string) {
  const ok = cond ? "PASS" : "FAIL";
  if (!cond) failures++;
  console.log(`[${ok}] ${name} — ${detail}`);
}
const near = (a: number, b: number, tol = 2) => Math.abs(a - b) <= tol;

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

// 1. Strong multi-platform creator with real API metrics on YouTube.
const strong: PlatformScoreInput[] = [
  {
    platform: "youtube",
    followers: 200_000,
    source: "api",
    metrics: {
      avg_likes: 8000,
      avg_comments: 600,
      avg_views: 150_000,
      post_count: 20,
      posts_per_week: 3,
      last_post_at: daysAgo(2),
    },
  },
  { platform: "instagram", followers: 100_000, engagementRate: 6, source: "manual", metrics: null },
];
const s1 = computeUgcScore(strong);
console.log("strong:", JSON.stringify(s1));
check("strong score", near(s1.score, 77, 3), `score=${s1.score} (~77)`);
check("strong tier", s1.tier === "Strong", `tier=${s1.tier}`);
check("strong confidence", near(s1.components.confidence, 0.65, 0.02), `conf=${s1.components.confidence}`);

// 2. Manual single-platform self-report (followers + ER only).
const manual: PlatformScoreInput[] = [
  { platform: "instagram", followers: 50_000, engagementRate: 5, source: "manual", metrics: null },
];
const s2 = computeUgcScore(manual);
console.log("manual:", JSON.stringify(s2));
check("manual score renormalizes", near(s2.score, 56, 3), `score=${s2.score} (~56)`);
check("manual tier", s2.tier === "Rising", `tier=${s2.tier}`);
check("manual reach absent => 0", s2.components.reach === 0, `reach=${s2.components.reach}`);
check("manual low confidence", near(s2.components.confidence, 0.3, 0.01), `conf=${s2.components.confidence}`);

// 3. Empty input must not throw and yields a floor score.
const s3 = computeUgcScore([]);
console.log("empty:", JSON.stringify(s3));
check("empty does not throw", true, "ok");
check("empty score 0", s3.score === 0, `score=${s3.score}`);
check("empty tier Emerging", s3.tier === "Emerging", `tier=${s3.tier}`);

// 4. Dormant account tanks consistency (stale + infrequent).
const dormant: PlatformScoreInput[] = [
  {
    platform: "youtube",
    followers: 30_000,
    source: "api",
    metrics: {
      avg_likes: 500,
      avg_comments: 40,
      avg_views: 9000,
      post_count: 5,
      posts_per_week: 0.1,
      last_post_at: daysAgo(90),
    },
  },
];
const s4 = computeUgcScore(dormant);
console.log("dormant:", JSON.stringify(s4));
check("dormant consistency low", s4.components.consistency < 10, `consistency=${s4.components.consistency}`);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
