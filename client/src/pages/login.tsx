import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [registerUsername, setRegisterUsername] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerPassword, setRegisterPassword] = useState<string>("");
  const [registerFullName, setRegisterFullName] = useState<string>("");
  const [registerUserType, setRegisterUserType] = useState<string>("tourist");
  const [loggingIn, setLoggingIn] = useState(false);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting...", user);
      
      if (user.userType === "guide") {
        setLocation("/guide-dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    
    try {
      const loggedInUser = await login(loginUsername, loginPassword);
      
      // The login function already sets window.auth in AuthContext, but let's double check
      if (!(window as any).auth) {
        console.log("Setting window.auth manually after login");
        (window as any).auth = { user: loggedInUser };
      }
      
      console.log("Login successful:", loggedInUser);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.fullName}!`,
      });
      
      // Redirect based on user type
      if (loggedInUser.userType === "guide") {
        setLocation("/guide-dashboard");
      } else {
        setLocation("/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };
  
  const handleQuickLogin = async (userType: 'guide' | 'tourist') => {
    setLoggingIn(true);
    
    try {
      const loggedInUser = await login(userType, 'password');
      
      toast({
        title: "Demo Login",
        description: `Logged in as ${userType}`,
      });
      
      // Redirect based on user type
      if (userType === "guide") {
        setLocation("/guide-dashboard");
      } else {
        setLocation("/dashboard");
      }
      
    } catch (error) {
      console.error("Quick login error:", error);
      toast({
        title: "Login failed",
        description: "Could not complete demo login.",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  // If already loading or redirecting, show minimal loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Maharashtra Tour Guide</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm text-[#DC143C] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#DC143C] hover:bg-[#B01030]"
                  disabled={loggingIn}
                >
                  {loggingIn ? "Logging in..." : "Sign in"}
                </Button>
                
                {/* Quick login buttons for demo */}
                <div className="w-full flex justify-between space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#DC143C] text-[#DC143C]"
                    onClick={() => handleQuickLogin('tourist')}
                    disabled={loggingIn}
                  >
                    Tourist Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#DC143C] text-[#DC143C]"
                    onClick={() => handleQuickLogin('guide')}
                    disabled={loggingIn}
                  >
                    Guide Demo
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  placeholder="Enter your full name"
                  required
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <Input
                  id="reg-username"
                  placeholder="Choose a username"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="tourist"
                      name="userType"
                      value="tourist"
                      checked={registerUserType === "tourist"}
                      onChange={() => setRegisterUserType("tourist")}
                      className="form-radio h-4 w-4 text-[#DC143C]"
                    />
                    <label htmlFor="tourist" className="ml-2">
                      Tourist
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="guide"
                      name="userType"
                      value="guide"
                      checked={registerUserType === "guide"}
                      onChange={() => setRegisterUserType("guide")}
                      className="form-radio h-4 w-4 text-[#DC143C]"
                    />
                    <label htmlFor="guide" className="ml-2">
                      Tour Guide
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-[#DC143C] hover:bg-[#B01030]"
                onClick={() => {
                  toast({
                    title: "Registration in demo mode",
                    description: "Please use the quick login options to test the app",
                  });
                }}
              >
                Create account
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
        <div className="px-8 pb-6 text-center text-sm">
          <span className="text-gray-500">© 2023 Maharashtra Tour Guide</span>
        </div>
      </Card>
    </div>
  );
} 