<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$env = parse_ini_file('.env');
$openai_key = $env['OPENAI_API_KEY'] ?? null;
if (!$openai_key) {
    echo json_encode(['error' => 'Missing OpenAI key']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$source  = trim($input['source'] ?? '');
$address = trim($input['address'] ?? '');

if (!$source || strlen($source) < 50) {
    echo json_encode(['error' => 'Invalid or missing source code']);
    exit;
}

$key = $address !== ''
    ? strtolower($address)
    : md5($source);

$cacheFile = 'analysis-cache.json';
$cache = file_exists($cacheFile)
    ? json_decode(file_get_contents($cacheFile), true)
    : [];

if (isset($cache[$key])) {
    echo json_encode(['cached' => true] + $cache[$key]);
    exit;
}

$prompt = [
  [
    "role"    => "system",
    "content" => "You are a top-tier blockchain security auditor. Analyze Solidity/EVM bytecode with depth and precision."
  ],
  [
    "role"    => "user",
    "content" =>
      "Smart contract address: $address\n\n" .
      "Source code:\n```solidity\n$source\n```\n\n" .
      "Please produce a JSON object with these fields:\n" .
      "1. trust_score (integer 0–100)\n" .
      "2. summary (1-2 sentences)\n" .
      "3. security_findings: array of { issue, severity (low/med/high), recommendation }\n" .
      "4. gas_optimizations: array of suggestions\n" .
      "5. references: list of any CVE IDs, best-practice docs, or blog posts you drew on."
  ]
];

curl_setopt_array($ch, [
  CURLOPT_POSTFIELDS => json_encode([
    "model"       => "gpt-4",
    "messages"    => $prompt,
    "temperature" => 0.2,
    "max_tokens"  => 700
  ])
]);


$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    echo json_encode(['error' => 'OpenAI request failed']);
    exit;
}

$data = json_decode($response, true);
$text = trim($data['choices'][0]['message']['content'] ?? '');

// Extract numeric score
preg_match('/(\d{1,3})\/?100/', $text, $m);
$score = isset($m[1]) ? intval($m[1]) : null;

$result = [
    'score'    => $score,
    'analysis' => $text
];

// Cache under the computed key
$cache[$key] = $result;
file_put_contents($cacheFile, json_encode($cache, JSON_PRETTY_PRINT));

echo json_encode($result);
