uvicorn:
	uvicorn backend.main:app --reload

run:
	cd frontend && npm.cmd run dev

.PHONY: uvicorn run