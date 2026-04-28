curl -X POST "https://budget-ai-backend.onrender.com/openai/send-message" \
  -H "Content-Type: application/json" \
  -d '{
	"messages": [
		{"role": "system", "content": "You are a helpful assistant for a budgeting app called BudgetAI. Your job is to help the user log their expenses and navigate the app."},
		{"role": "user", "content": "I spent $15 on lunch today."}
	]
  }'
  