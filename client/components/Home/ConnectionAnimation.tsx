import React, { useEffect, useState } from 'react';
import { Laptop, Smartphone, Server, CloudLightning } from 'lucide-react';
import man1 from '@/public/Home/man1.png';
import man2 from '@/public/Home/man2.png';
import girl1 from '@/public/Home/girl1.png';
import girl2 from '@/public/Home/girl2.png';
import boy1 from '@/public/Home/boy1.png';
import Image from 'next/image';
// Define device types
type DeviceType = 'laptop' | 'phone' | 'server' | 'cloud' | 'cable';

interface Device {
  id: number;
  type: DeviceType;
  x: number;
  y: number;
}

interface Connection {
  from: number;
  to: number;
  active: boolean;
  progress: number;
  speed: number;
}

const ConnectionAnimation: React.FC = () => {
  // Create random devices
  const [devices, setDevices] = useState<Device[]>([
    { id: 1, type: 'laptop', x: 15, y: 20 },
    { id: 2, type: 'phone', x: 75, y: 30 },
    { id: 3, type: 'server', x: 25, y: 70 },
    { id: 4, type: 'cloud', x: 65, y: 80 },
    { id: 5, type: 'cable', x: 85, y: 55 },
  ]);

  // Define connections between devices
  const [connections, setConnections] = useState<Connection[]>([
    { from: 1, to: 2, active: false, progress: 0, speed: 0.01 },
    { from: 1, to: 3, active: false, progress: 0, speed: 0.005 },
    { from: 2, to: 4, active: false, progress: 0, speed: 0.008 },
    { from: 3, to: 5, active: false, progress: 0, speed: 0.012 },
    { from: 4, to: 5, active: false, progress: 0, speed: 0.007 },
  ]);

  // Animation for data packets
  useEffect(() => {
    const interval = setInterval(() => {
      // Update connections - activate random ones and animate data flow
      setConnections(prevConnections => {
        return prevConnections.map(conn => {
          // Randomly activate connections
          if (!conn.active && Math.random() < 0.02) {
            return { ...conn, active: true };
          }

          // Update progress for active connections
          if (conn.active) {
            const newProgress = conn.progress + conn.speed;

            // Reset when complete
            if (newProgress >= 1) {
              return { ...conn, active: false, progress: 0 };
            }

            return { ...conn, progress: newProgress };
          }

          return conn;
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Render device icon based on type
  const renderDevice = (device: Device) => {
    const baseClasses = "p-3 rounded-full bg-black/40 backdrop-blur-sm shadow-lg";

    switch (device.type) {
      case 'laptop':
        return (
          <div className={`${baseClasses} border border-blue-500/30`}>
            <Image alt="man1" src={man1} className="w-18 h-18 text-blue-400 rounded-full" />
            {/* <Laptop className="w-6 h-6 text-blue-400" /> */}
          </div>
        );
      case 'phone':
        return (
          <div className={`${baseClasses} border border-purple-500/30 `}>
            <Image alt="man2" src={man2} className="w-18 h-18 text-blue-400 rounded-full" />
            {/* <Smartphone className="w-6 h-6 text-purple-400" /> */}
          </div>
        );
      case 'server':
        return (
          <div className={`${baseClasses} border border-green-500/30`}>
            <Image alt="girl1" src={girl1} className="w-18 h-18 text-blue-400 rounded-full" />
            {/* <Server className="w-6 h-6 text-green-400" /> */}
          </div>
        );
      case 'cloud':
        return (
          <div className={`${baseClasses} border border-teal-500/30`}>
            <Image alt="girl2" src={girl2} className="w-18 h-18 text-blue-400 rounded-full" />
            {/* <CloudLightning className="w-6 h-6 text-teal-400" /> */}
          </div>
        );
      case 'cable':
        return (
          <div className={`${baseClasses} border border-teal-500/30`}>
            <Image alt="boy1" src={boy1} className="w-18 text-blue-400 rounded-full" />
            {/* <CloudLightning className="w-6 h-6 text-teal-400" /> */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-slate-900/50 rounded-2xl backdrop-blur-sm border border-white/10 shadow-xl p-4 overflow-hidden">
      {/* Glow effect in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

      {/* Render connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {connections.map((conn, index) => {
          const fromDevice = devices.find(d => d.id === conn.from);
          const toDevice = devices.find(d => d.id === conn.to);

          if (!fromDevice || !toDevice) return null;

          return (
            <g key={index}>
              {/* Base connection line */}
              <line
                x1={fromDevice.x}
                y1={fromDevice.y}
                x2={toDevice.x}
                y2={toDevice.y}
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="1"
              />

              {/* Animated data packet */}
              {conn.active && (
                <>
                  {/* Glowing connection line */}
                  <line
                    x1={fromDevice.x}
                    y1={fromDevice.y}
                    x2={fromDevice.x + (toDevice.x - fromDevice.x) * conn.progress}
                    y2={fromDevice.y + (toDevice.y - fromDevice.y) * conn.progress}
                    stroke="rgb(116, 76, 197)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Data packet */}
                  <circle
                    cx={fromDevice.x + (toDevice.x - fromDevice.x) * conn.progress}
                    cy={fromDevice.y + (toDevice.y - fromDevice.y) * conn.progress}
                    r="1.5"
                    fill="#60a5fa"
                    className="filter drop-shadow-lg"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render devices */}
      <div className="relative w-full h-full">
        {devices.map(device => (
          <div
            key={device.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
            style={{
              left: `${device.x}%`,
              top: `${device.y}%`
            }}
          >
            {renderDevice(device)}
          </div>
        ))}
      </div>

      {/* Additional details */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
          <span className="text-xs text-blue-300">Live Network</span>
        </div>
        <div className="bg-slate-800/60 px-2 py-1 rounded-full border border-slate-700/50">
          <span className="text-xs text-slate-300">P2P Secured</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionAnimation;