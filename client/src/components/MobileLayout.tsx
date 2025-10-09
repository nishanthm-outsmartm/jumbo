import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Target, 
  Newspaper, 
  Gift, 
  User,
  Shield,
  Key,
  LogOut
} from 'lucide-react';
import { RecoveryKeyModal } from '@/components/auth/RecoveryKeyModal';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showRecoveryKey, setShowRecoveryKey] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const renderProfileContent = () => (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user?.handle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{user?.handle}</h2>
              <Badge variant={user?.userType === 'REGISTERED' ? 'secondary' : 'outline'}>
                {user?.userType === 'REGISTERED' ? 'Registered User' : 'Anonymous User'}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{user?.points}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{user?.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.userType === 'ANONYMOUS' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Protect your anonymous account with a recovery key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowRecoveryKey(true)}
              className="w-full"
              variant="outline"
            >
              <Key className="mr-2 h-4 w-4" />
              Generate Recovery Key
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileContent();
      default:
        return children;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Recovery Key Modal */}
      <RecoveryKeyModal 
        open={showRecoveryKey} 
        onOpenChange={setShowRecoveryKey} 
      />
    </div>
  );
}
