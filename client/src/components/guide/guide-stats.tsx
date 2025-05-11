import { Card, CardContent } from "../ui/card";

const GuideStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC143C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-2xl font-bold">5</div>
          <div className="text-xs text-gray-500">Active Clients</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 8c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z" />
              <path d="M3 18v-2c0-2.2 3.1-4 7-4" />
              <path d="M17 18.8c2.3-.5 4-2 4-3.8v-2" />
              <path d="M19 12.6V11a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v1.6" />
            </svg>
          </div>
          <div className="text-2xl font-bold">₹32,500</div>
          <div className="text-xs text-gray-500">Earnings This Month</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div className="text-2xl font-bold">8</div>
          <div className="text-xs text-gray-500">Pending Requests</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="purple"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 4-3 4-6.5-2.5 0-4 2.5-4 2.5v-7c0-1.5-1.5-3-3-3s-3 1.5-3 3v7c0-1.5-1.5-3-3-3s-3 1.5-3 3v9l3-3" />
            </svg>
          </div>
          <div className="text-2xl font-bold">4.9</div>
          <div className="text-xs text-gray-500">Rating (26 reviews)</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuideStats;