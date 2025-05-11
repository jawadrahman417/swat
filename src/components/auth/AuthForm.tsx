
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck } from "lucide-react"; // Using ShieldCheck for 2FA icon
import { useToast } from "@/hooks/use-toast";

// Placeholder icons for social media (replace with actual SVGs or lucide icons if available)
const GoogleIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M21.35 11.1h-9.03v2.76h5.14c-.22.98-.76 1.83-1.55 2.42v1.87h2.4c1.4-1.3 2.2-3.2 2.2-5.34 0-.72-.07-1.4-.2-2.05z"/><path fill="#34A853" d="M12.32 22c2.37 0 4.36-.78 5.81-2.12l-2.4-1.87c-.78.52-1.78.83-2.91.83-2.25 0-4.15-1.52-4.83-3.56H2.68v1.93c1.44 2.86 4.3 4.82 7.64 4.82z"/><path fill="#FBBC05" d="M7.49 14.67c-.2-.59-.32-1.22-.32-1.87s.12-1.28.32-1.87V9.06H2.68C1.93 10.47 1.5 12.17 1.5 14s.43 3.53 1.18 4.94l2.81-2.27z"/><path fill="#EA4335" d="M12.32 7.18c1.3 0 2.45.45 3.36 1.32l2.12-2.12C16.2.92 14.21 0 11.82 0 8.48 0 5.62 2.01 4.18 4.87l2.81 2.18c.68-2.04 2.58-3.57 4.83-3.57z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#1877F2" d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24h11.494v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.324V1.324C24 .593 23.407 0 22.676 0z"/></svg>;
const LinkedInIcon = () => <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#0A66C2" d="M20.447 20.447h-3.554v-5.57c0-1.328-.027-3.037-1.85-3.037-1.852 0-2.136 1.445-2.136 2.942v5.665H9.353V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.6 0 4.267 2.37 4.267 5.455v6.281zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 012.063-2.065 2.064 2.064 0 012.063 2.065A2.063 2.063 0 015.337 7.433zm1.776 13.014H3.56V9h3.553v11.447z"/><path d="M0 0h24v24H0z" fill="none"/></svg>;


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
  enable2FA: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthForm() {
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", phoneNumber: "", enable2FA: false },
  });

  function onLoginSubmit(values: LoginFormValues) {
    console.log("Login submitted:", values);
    // This is a placeholder. Actual login logic (e.g., API call to Firebase Auth) needs to be implemented.
    toast({
      title: "Login Attempt (Placeholder)",
      description: "Login functionality is a placeholder. User data logged to console. Backend integration required.",
      variant: "default"
    });
  }

  function onSignupSubmit(values: SignupFormValues) {
    console.log("Signup submitted:", values);
    // This is a placeholder. Actual signup logic (e.g., API call to Firebase Auth) needs to be implemented.
    toast({
      title: "Sign Up Attempt (Placeholder)",
      description: "Sign up functionality is a placeholder. User data logged to console. Backend integration required.",
      variant: "default"
    });
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login attempt`);
    // This is a placeholder. Actual social login (e.g., Firebase Auth with Google/Facebook) needs to be implemented.
    toast({
      title: `Social Login Attempt (${provider}) (Placeholder)`,
      description: `${provider} login is a placeholder. Backend and provider setup required.`,
      variant: "default"
    });
  };

  const socialLoginButtons = (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("Google")}>
        <GoogleIcon /> <span className="ml-2">Continue with Google</span>
      </Button>
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("Facebook")}>
        <FacebookIcon /> <span className="ml-2">Continue with Facebook</span>
      </Button>
      <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("LinkedIn")}>
        <LinkedInIcon /> <span className="ml-2">Continue with LinkedIn</span>
      </Button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login to PropSwap</CardTitle>
              <CardDescription>Access your account to manage properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" variant="default">Login</Button>
                </form>
              </Form>
              <Separator className="my-6" />
              {socialLoginButtons}
            </CardContent>
             <CardFooter>
              <p className="text-xs text-muted-foreground text-center w-full">
                By continuing, you agree to PropSwap's Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create your PropSwap Account</CardTitle>
              <CardDescription>Join us to find or list properties.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Choose a strong password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Re-enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={signupForm.control}
                    name="enable2FA"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                           <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Enable Two-Factor Authentication (Optional)
                          </FormLabel>
                           <p className="text-xs text-muted-foreground">
                            Enhance your account security.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" variant="default">Create Account</Button>
                </form>
              </Form>
              <Separator className="my-6" />
              {socialLoginButtons}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground text-center w-full">
                By creating an account, you agree to PropSwap's Terms and Conditions.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

