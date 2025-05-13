import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useToast } from "../hooks/use-toast";
import { useState } from "react";
import type { User } from "../shared/schema";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  phone: z.string().min(10, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterScreenProps {
  register: (name: string, email: string, password: string, userType: string) => Promise<User>;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ register }) => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'tourist' | 'guide'>('tourist');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      const user = await register(
        data.name,
        data.email,
        data.password,
        userType
      );
      
      toast({
        title: "Registration successful",
        description: "Welcome to Maharashtra Wanderer!",
        duration: 5000,
      });
      
      if (user.isGuide) {
        setLocation("/guide-dashboard");
      } else {
        setLocation("/dashboard");
      }
      
    } catch (error) {
      console.error("Registration failed:", error);
      
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white p-6">
      <h1 className="text-2xl font-bold font-sans mb-6">Maharashtra Wanderer</h1>
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-medium mb-4">Create a new account</h2>
          
          <div className="flex mb-6 border-b">
            <button 
              className="py-2 px-4 text-gray-500"
              onClick={() => setLocation('/login')}
            >
              Login
            </button>
            <button className="py-2 px-4 border-b-2 border-[#DC143C] text-[#DC143C] font-medium">
              Register
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              className={`py-3 px-4 text-center rounded ${
                userType === 'tourist' 
                  ? 'bg-[#DC143C] text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setUserType('tourist')}
            >
              Tourist
            </button>
            <button
              type="button"
              className={`py-3 px-4 text-center rounded ${
                userType === 'guide' 
                  ? 'bg-[#DC143C] text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setUserType('guide')}
            >
              Guide
            </button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="tel" placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Confirm Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 bg-[#DC143C] hover:bg-[#B01030] text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterScreen;
