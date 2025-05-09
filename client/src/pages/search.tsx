import { Layout } from "@/components/layout";
import MapView from "@/components/map-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Store, Coffee, Hotel, Landmark } from "lucide-react";
import { useState } from "react";

const topCategories = [
  { name: "Medical Stores", icon: Store },
  { name: "Restaurants", icon: Coffee },
  { name: "Hotels", icon: Hotel },
  { name: "ATMs", icon: Store },
  { name: "Shopping", icon: Store },
];

const gridCategories = [
  { name: "Attractions", icon: Landmark },
  { name: "Guides", icon: MapPin },
  { name: "Points of Interest", icon: MapPin },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search places, guides, or attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <ScrollArea className="whitespace-nowrap pb-2">
            <div className="flex space-x-2">
              {topCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1">
          <MapView
            markers={[]}
            onMarkerClick={() => {}}
            onDragEnd={() => {}}
            className="w-full h-full"
          />
        </div>

        <Card className="mx-4 mb-4 p-4">
          <div className="grid grid-cols-3 gap-4">
            {gridCategories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                onClick={() => setSelectedCategory(category.name)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <category.icon className="h-6 w-6 mb-2" />
                <span className="text-sm text-center">{category.name}</span>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SearchPage;
