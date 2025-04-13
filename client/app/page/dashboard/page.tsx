import { auth } from '@clerk/nextjs/server';

export default function DashboardPage() {
  const { userId } = auth();

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>User ID: {userId}</p>
    </div>
  );
}
