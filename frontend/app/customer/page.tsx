"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Fuel, Truck, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Subscription {
  _id: string;
  fuelType: string;
  quantity: number;
  amount: number;
  status: string;
  nextDeliveryDate: string;
  deliveryAddress: {
    street: string;
    city: string;
  };
}

interface Delivery {
  _id: string;
  fuelType: string;
  quantity: number;
  status: string;
  scheduledTime: string;
}

export default function CustomerDashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upcomingDelivery, setUpcomingDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setSubscription(data.data[0]);
      }

      // Fetch upcoming deliveries
      const deliveryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deliveryData = await deliveryResponse.json();
      
      if (deliveryData.success && deliveryData.data.length > 0) {
        const upcoming = deliveryData.data.find((d: Delivery) => d.status !== "delivered");
        setUpcomingDelivery(upcoming || null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your fuel subscriptions and deliveries.</p>
      </div>

      {!subscription ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Fuel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Set up your first fuel subscription to get started.
              </p>
              <Button asChild>
                <Link href="/customer/subscriptions/new">Create Subscription</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Subscription Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Fuel className="h-4 w-4 mr-2 text-primary" />
                  Fuel Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">{subscription.fuelType}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-primary" />
                  Next Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDelivery ? (
                  <>
                    <p className="text-2xl font-bold">{upcomingDelivery.quantity}L</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(upcomingDelivery.scheduledTime).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No upcoming deliveries</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subscription.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : subscription.status === "paused"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {subscription.status}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Delivery Alert */}
          {upcomingDelivery && upcomingDelivery.status !== "delivered" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">Upcoming Delivery</h3>
                    <p className="text-sm text-yellow-700">
                      {upcomingDelivery.quantity}L of {upcomingDelivery.fuelType} scheduled for{" "}
                      {new Date(upcomingDelivery.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline">
              <Link href="/customer/subscriptions">
                <Fuel className="h-4 w-4 mr-2" />
                View Subscriptions
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/deliveries">
                <Truck className="h-4 w-4 mr-2" />
                Track Delivery
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/payments">
                <Calendar className="h-4 w-4 mr-2" />
                Payment History
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/customer/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

import { BarChart3 } from "lucide-react";
