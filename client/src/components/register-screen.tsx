import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterScreen: React.FC = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<'tourist' | 'guide'>('tourist');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole') as 'tourist' | 'guide' | null;
    if (storedRole) {
      setUserType(storedRole);
    }
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      const { confirmPassword, ...userData } = data;
      
      const response = await apiRequest("POST", "/api/auth/register", {
        ...userData,
        userType,
      });
      
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "You can now login to your account",
        });
        setLocation("/login");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
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
          
          <div className="flex space-x-2 mb-4">
            <Button
              type="button"
              className={`flex-1 py-2 ${userType === 'tourist' ? 'bg-[#DC143C] text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
              onClick={() => setUserType('tourist')}
            >
              Tourist
            </Button>
            <Button
              type="button"
              className={`flex-1 py-2 ${userType === 'guide' ? 'bg-[#DC143C] text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
              onClick={() => setUserType('guide')}
            >
              Guide
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="fullName"
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
                      <Input placeholder="Email" type="email" {...field} />
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
                      <Input placeholder="Phone Number" type="tel" {...field} />
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
                      <Input placeholder="Password" type="password" {...field} />
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
                      <Input placeholder="Confirm Password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-3 bg-[#DC143C] hover:bg-[#B01030] text-white"
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
