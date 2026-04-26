CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    daily_ai_limit INT NOT NULL,
    max_tasks INT NOT NULL,
    max_habits INT NOT NULL,
    max_workspaces INT NOT NULL
);

INSERT INTO plans (id, name, daily_ai_limit, max_tasks, max_habits, max_workspaces) 
VALUES ('free', 'Free Forever', 20, 100, 20, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, name, daily_ai_limit, max_tasks, max_habits, max_workspaces) 
VALUES ('pro', 'Mithra Pro', 1000, 10000, 100, 10)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_plans (
    user_id VARCHAR(128) PRIMARY KEY,
    plan_id VARCHAR(50) REFERENCES plans(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);
