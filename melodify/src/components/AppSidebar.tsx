import React from 'react';
import { Home, Search, Clock, Music, X } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface AppSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  playlist: Song[];
  recentlyPlayed: Song[];
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  currentSection,
  onSectionChange,
  playlist,
  recentlyPlayed,
}) => {
  const { toggleSidebar } = useSidebar();

  const menuItems = [
    {
      title: 'Home',
      icon: Home,
      section: 'home',
    },
    {
      title: 'Search',
      icon: Search,
      section: 'search',
    },
    {
      title: 'Recently Played',
      icon: Clock,
      section: 'recent',
    },
  ];

  return (
    <Sidebar
      className="z-50 border-r-0 bg-gray-900/95 backdrop-blur-md"
      variant="sidebar"
      collapsible="offcanvas"
    >
      <SidebarHeader className="p-4 border-b border-gray-700/50 bg-gray-800/80">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Melodify
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-300 hover:text-white" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-900/95">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 p-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => {
                      onSectionChange(item.section);
                      toggleSidebar(); // close on select
                    }}
                    isActive={currentSection === item.section}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      currentSection === item.section
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <div className="px-4 py-2">
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4">
              Your Library
            </h3>
            <button
              onClick={() => {
                onSectionChange('playlist');
                toggleSidebar();
              }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                currentSection === 'playlist'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Music className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">My Playlist</p>
                <p className="text-sm text-gray-400">{playlist.length} songs</p>
              </div>
            </button>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
