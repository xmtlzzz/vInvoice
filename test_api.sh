#!/bin/bash
echo "=== TEST A: Login as sz ==="
curl -s -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"username":"sz","password":"sz123456"}'
echo ""
echo "---END_A---"
echo "=== TEST B: Login as admin ==="
curl -s -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
echo ""
echo "---END_B---"
echo "=== TEST C: Get sz projects ==="
curl -s "http://localhost:3001/api?namespace=ns_sz" -H "x-user-namespace: ns_sz"
echo ""
echo "---END_C---"
echo "=== TEST D: Add expense ==="
curl -s -X POST http://localhost:3001/api/projects/proj_sz_001/expenses -H "Content-Type: application/json" -d '{"type":"TAXI","amount":50,"date":"2026-05-03","description":"test expense"}'
echo ""
echo "---END_D---"
echo "=== TEST E: Create custom type ==="
curl -s -X POST http://localhost:3001/api/custom-types -H "Content-Type: application/json" -H "x-user-namespace: ns_sz" -d '{"key":"TEST_TYPE","label":"测试类型","icon":"Plane"}'
echo ""
echo "---END_E---"
echo "=== TEST F: Delete custom type ==="
curl -s -X DELETE http://localhost:3001/api/custom-types/TEST_TYPE -H "x-user-namespace: ns_sz"
echo ""
echo "---END_F---"
echo "ALL TESTS DONE"
