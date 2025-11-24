
"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const announcements = [
  {
    title: "Special Announcement",
    description: "Join us for a live event on 27th July, 2025 at 11 AM.",
    imageUrl: "https://images.indianexpress.com/2022/07/railway-celeb-1.jpg?w=1200", 
    dataAiHint: "event announcement indian railways",
    style: {
      backgroundColor: "#E6F7FF",
      color: "#0d47a1"
    }
  },
  {
    title: "New Vande Bharat Express",
    description: "Experience the future of train travel with our new fleet of Vande Bharat Express trains across India.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Vande_Bharat_Express_around_Mumbai.jpg",
    dataAiHint: "modern train vande bharat express",
    style: {
      backgroundColor: "#E3F2FD",
      color: "#0D47A1"
    }
  },
  {
    title: "Railway Asset Leasing",
    description: "Explore our railway leasing system for locomotives, wagons, and depots under Indian Railways.",
    imageUrl: "https://etimg.etb2bimg.com/thumb/msid-110237798,width-1200,height-900,resizemode-4/.jpg",
    dataAiHint: "railway asset leasing india",
    style: {
      backgroundColor: "#FFF3E0",
      color: "#BF360C"
    }
  },
  {
    title: "Smart Rail Infrastructure",
    description: "Integrating IoT and AI for efficient railway leasing, monitoring, and management.",
    imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=1200&q=80",
    dataAiHint: "smart rail infrastructure india",
    style: {
      backgroundColor: "#E3F2FD",
      color: "#0D47A1"
    }
  },
  {
    title: "Sustainable Railway Operations",
    description: "Leasing eco-friendly rolling stock and promoting green train initiatives under Indian Railways.",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    dataAiHint: "green railway leasing india",
    style: {
      backgroundColor: "#E8F5E9",
      color: "#2E7D32"
    }
  }
];

export function UserDashboardCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
          loop: true,
      }}
    >
      <CarouselContent>
        {announcements.map((item, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="relative flex aspect-[2.4/1] items-center justify-center p-0">
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={item.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-8 md:p-12 flex flex-col justify-end">
                        <h2 className="text-white text-2xl md:text-4xl font-bold">{item.title}</h2>
                        <p className="text-white/90 mt-2 text-md md:text-lg">{item.description}</p>
                    </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
