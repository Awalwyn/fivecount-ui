'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Trophy, Users, Edit2 } from 'lucide-react';

export default function HeaderExamplesPage() {
  const mockAthlete = {
    name: 'Marcus Chen',
    username: '@marcuschen',
    club: 'Elite Gymnastics Academy',
    location: 'Austin, TX',
    level: 'Level 10',
    gradYear: '2025',
    followers: 1247,
    following: 89,
    bio: 'Level 10 gymnast | Team USA Development | Floor & Vault specialist',
  };

  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      <h1 className="text-2xl font-bold text-foreground mb-8">Profile Header Options</h1>

      {/* Option 1: Cover Photo + Overlapping Avatar */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Option 1: Cover Photo + Overlapping Avatar</h2>
        <p className="text-sm text-muted-foreground mb-4">Instagram/Twitter style - Most visual impact</p>
        
        <div className="bg-card border border-border rounded-xl overflow-hidden max-w-4xl">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 relative">
            <Button size="sm" variant="secondary" className="absolute top-4 right-4 opacity-80">
              <Edit2 className="w-4 h-4 mr-1" /> Edit Cover
            </Button>
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            {/* Avatar - overlapping the cover */}
            <div className="flex justify-between items-end -mt-16 mb-4">
              <Avatar className="w-32 h-32 border-4 border-card">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">MC</AvatarFallback>
              </Avatar>
              <Button className="mt-20">Edit Profile</Button>
            </div>
            
            {/* Name and info */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{mockAthlete.name}</h1>
                <p className="text-muted-foreground">{mockAthlete.username}</p>
              </div>
              
              <p className="text-foreground">{mockAthlete.bio}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{mockAthlete.location}</span>
                <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{mockAthlete.level}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Class of {mockAthlete.gradYear}</span>
              </div>
              
              <div className="flex gap-4 text-sm">
                <span><strong className="text-foreground">{mockAthlete.followers.toLocaleString()}</strong> <span className="text-muted-foreground">followers</span></span>
                <span><strong className="text-foreground">{mockAthlete.following}</strong> <span className="text-muted-foreground">following</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Option 2: Side-by-side (Current) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Option 2: Side-by-Side Layout</h2>
        <p className="text-sm text-muted-foreground mb-4">Current style - Compact and functional</p>
        
        <div className="bg-card border border-border rounded-xl p-6 max-w-4xl">
          <div className="flex gap-6">
            <Avatar className="w-24 h-24 flex-shrink-0">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">MC</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground">{mockAthlete.name}</h1>
                  <p className="text-sm text-muted-foreground">{mockAthlete.club}</p>
                </div>
                <Button size="sm">Edit Profile</Button>
              </div>
              
              <p className="text-sm text-foreground">{mockAthlete.bio}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{mockAthlete.level}</Badge>
                <Badge variant="secondary">{mockAthlete.location}</Badge>
                <Badge variant="secondary">Class of {mockAthlete.gradYear}</Badge>
              </div>
              
              <div className="flex gap-6 text-sm">
                <span><strong>{mockAthlete.followers.toLocaleString()}</strong> followers</span>
                <span><strong>{mockAthlete.following}</strong> following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Option 3: Centered Hero */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Option 3: Centered Hero</h2>
        <p className="text-sm text-muted-foreground mb-4">Portfolio style - Clean and symmetrical</p>
        
        <div className="bg-card border border-border rounded-xl p-8 max-w-4xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-28 h-28">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">MC</AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">{mockAthlete.name}</h1>
              <p className="text-muted-foreground">{mockAthlete.club}</p>
            </div>
            
            <p className="text-foreground max-w-md">{mockAthlete.bio}</p>
            
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">{mockAthlete.level}</Badge>
              <Badge variant="secondary">{mockAthlete.location}</Badge>
              <Badge variant="secondary">Class of {mockAthlete.gradYear}</Badge>
            </div>
            
            <div className="flex gap-8 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{mockAthlete.followers.toLocaleString()}</div>
                <div className="text-muted-foreground">followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{mockAthlete.following}</div>
                <div className="text-muted-foreground">following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">84.5</div>
                <div className="text-muted-foreground">avg AA</div>
              </div>
            </div>
            
            <Button>Edit Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
