import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { maharashtraDestinations } from "@/lib/mock-data";

const trainSearchSchema = z.object({
  from: z.string().min(1, "Origin is required"),
  to: z.string().min(1, "Destination is required"),
  departureDate: z.date({
    required_error: "Departure date is required",
  }),
  returnDate: z.date().optional(),
  passengers: z.string().min(1, "Number of passengers is required"),
  class: z.enum(["sleeper", "ac3Tier", "ac2Tier"], {
    required_error: "Class is required",
  }),
});

type TrainSearchFormValues = z.infer<typeof trainSearchSchema>;

interface TrainFormProps {
  onSearch: (data: TrainSearchFormValues) => void;
  isSearching: boolean;
}

const TrainForm: React.FC<TrainFormProps> = ({ onSearch, isSearching }) => {
  const form = useForm<TrainSearchFormValues>({
    resolver: zodResolver(trainSearchSchema),
    defaultValues: {
      from: "Mumbai",
      to: "Pune",
      passengers: "1 Passenger",
      class: "sleeper",
    },
  });
  
  const handleSubmit = (data: TrainSearchFormValues) => {
    onSearch(data);
  };

  // Define popular train routes
  const popularTrainRoutes = [
    { from: "Mumbai", to: "Pune" },
    { from: "Mumbai", to: "Nashik" },
    { from: "Mumbai", to: "Nagpur" },
    { from: "Pune", to: "Nagpur" },
    { from: "Pune", to: "Solapur" },
    { from: "Nashik", to: "Aurangabad" },
  ];

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem>
                <Label>From</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maharashtraDestinations.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <Label>To</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maharashtraDestinations.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex space-x-3">
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "dd-MM-yyyy")
                          ) : (
                            <span>dd-mm-yyyy</span>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto h-4 w-4 opacity-50"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <path d="M16 2v4" />
                            <path d="M8 2v4" />
                            <path d="M3 10h18" />
                          </svg>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Return Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "dd-MM-yyyy")
                          ) : (
                            <span>dd-mm-yyyy</span>
                          )}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto h-4 w-4 opacity-50"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <path d="M16 2v4" />
                            <path d="M8 2v4" />
                            <path d="M3 10h18" />
                          </svg>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const departureDate = form.getValues("departureDate");
                          return date < new Date() || (departureDate && date <= departureDate);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex space-x-3">
            <FormField
              control={form.control}
              name="passengers"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Passengers</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of passengers" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1 Passenger">1 Passenger</SelectItem>
                      <SelectItem value="2 Passengers">2 Passengers</SelectItem>
                      <SelectItem value="3 Passengers">3 Passengers</SelectItem>
                      <SelectItem value="4+ Passengers">4+ Passengers</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Label>Travel Class</Label>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sleeper">Sleeper</SelectItem>
                      <SelectItem value="ac3Tier">AC 3 Tier</SelectItem>
                      <SelectItem value="ac2Tier">AC 2 Tier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 bg-[#DC143C] hover:bg-[#B01030] text-white"
            disabled={isSearching}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 mr-2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            {isSearching ? "Searching..." : "Search Trains"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium mb-3">Popular Routes</h4>
        <div className="grid grid-cols-2 gap-2">
          {popularTrainRoutes.map((route, index) => (
            <button 
              key={index} 
              className="text-sm text-gray-700 py-2 hover:text-[#DC143C] text-left"
              onClick={() => {
                form.setValue("from", route.from);
                form.setValue("to", route.to);
              }}
            >
              {route.from} — {route.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainForm; 