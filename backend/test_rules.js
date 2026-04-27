const { runRuleEngine } = require('./rules/ruleEngine');

console.log("TEST 1: Empty Architecture (No Data Flows)");
let result1 = runRuleEngine({ components: [], data_flows: [] });
console.log(JSON.stringify(result1, null, 2));

console.log("\nTEST 2: Good Architecture (With Sensitive Data but no trust boundaries)");
let result2 = runRuleEngine({
  components: ["Frontend", "Backend"],
  databases: ["UserDB"],
  data_flows: ["Frontend -> Backend", "Backend -> UserDB"],
  sensitive_data: ["Passwords"],
  trust_boundaries: []
});
console.log(JSON.stringify(result2, null, 2));

console.log("\nTEST 3: Strict Entity Validation (Should discard if component not in components/databases)");
// In this case, "Backend" is in components, so it should be included.
// If we had no components list, it should discard.
let result3 = runRuleEngine({
  components: [],
  databases: [],
  data_flows: ["Frontend -> Backend", "Backend -> UserDB"],
  sensitive_data: ["Passwords"],
  trust_boundaries: []
});
console.log(JSON.stringify(result3, null, 2));
