import { useState, useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { UserContext } from "@/App";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Login from "./login";
import Register from "./register";
import { Routes } from "@/lib/constants";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user } = useContext(UserContext);
  const [_, navigate] = useLocation();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate(Routes.DASHBOARD);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-0">
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none h-14">
                <TabsTrigger value="login" className="text-lg font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="text-lg font-medium">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-0 m-0">
                <Login />
              </TabsContent>
              
              <TabsContent value="register" className="p-0 m-0">
                <Register />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;