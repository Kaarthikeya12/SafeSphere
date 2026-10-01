import type { LucideIcon } from "lucide-react";
import { CarFront, CloudLightning, Flame, HeartPulse, House, ShieldUser, Waves } from "lucide-react";

export type GuidanceTopic = {
  id: string;
  title: string;
  icon: LucideIcon;
  callFirst: { label: string; number: string }[];
  doNow: string[];
  avoid: string[];
  prepare: string[];
};

/**
 * Built-in, offline guidance: widely published general public-safety advice
 * (e.g. NDMA "Do's and Don'ts", standard first-aid practice) condensed for a
 * prototype. Not medical or legal advice. It must be reviewed by qualified
 * responders (first-aid trainer, fire service, DDMA) before real deployment.
 * Numbers listed are India's national emergency/helpline numbers.
 */
export const GUIDANCE: GuidanceTopic[] = [
  {
    id: "medical",
    title: "Medical emergency",
    icon: HeartPulse,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "Ambulance (most states)", number: "108" },
    ],
    doNow: [
      "Make sure the scene is safe before you approach.",
      "Check if the person responds and is breathing normally. Call 112 or 108 on speaker.",
      "Not breathing normally? If trained, start CPR — hard, fast pushes in the centre of the chest. The call-taker can guide you.",
      "Heavy bleeding: press firmly on the wound with a clean cloth and keep pressing.",
      "Breathing but unresponsive: place them on their side unless you suspect a spine injury.",
    ],
    avoid: [
      "Don’t give food or water to someone drowsy or unconscious.",
      "Don’t move someone with a suspected neck or back injury unless they’re in danger.",
    ],
    prepare: ["Keep a basic first-aid kit at home and in your bag.", "Note allergies and regular medicines for family members.", "Learn CPR from a certified course."],
  },
  {
    id: "fire",
    title: "Fire",
    icon: Flame,
    callFirst: [
      { label: "Fire service", number: "101" },
      { label: "All emergencies", number: "112" },
    ],
    doNow: [
      "Alert everyone and get out. Leave belongings behind.",
      "Stay low under smoke; cover your nose and mouth with cloth.",
      "Feel doors with the back of your hand. If hot, use another exit.",
      "Call 101 or 112 once outside. Say if anyone is still inside.",
      "Gas leak: don’t touch switches, close the regulator if safe, open windows and leave.",
      "Burns: cool under clean running water for 20 minutes.",
    ],
    avoid: ["Don’t use lifts.", "Don’t go back inside for belongings.", "Don’t put ice, toothpaste or oil on burns."],
    prepare: ["Know two ways out of your home, hostel or office.", "Keep exits and stairways clear.", "Switch off the LPG regulator when not cooking."],
  },
  {
    id: "road",
    title: "Road accident",
    icon: CarFront,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "Ambulance (most states)", number: "108" },
    ],
    doNow: [
      "Protect yourself first: park safely, switch on hazard lights, warn traffic.",
      "Call 112 or 108 with the exact location — road, landmark, or your coordinates.",
      "Switch off crashed vehicles’ engines if safe.",
      "Press firmly on heavy bleeding. Keep injured people warm and calm.",
      "Good Samaritans who help in good faith are protected under Section 134A of the Motor Vehicles Act.",
    ],
    avoid: [
      "Don’t move injured people unless there’s immediate danger such as fire.",
      "Don’t remove a rider’s helmet unless they aren’t breathing and you’re trained.",
      "Don’t crowd the scene or block ambulances.",
    ],
    prepare: ["Wear a helmet and seatbelt every trip.", "Save emergency contacts in your phone’s emergency/ICE settings."],
  },
  {
    id: "flood",
    title: "Floods",
    icon: Waves,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "District disaster control room (most districts)", number: "1077" },
    ],
    doNow: [
      "Follow alerts from IMD, your district administration and local news.",
      "Move to higher ground early — don’t wait for water to rise.",
      "Switch off electricity at the mains if it’s safe to reach.",
      "Drink boiled or bottled water; floodwater contaminates supplies.",
    ],
    avoid: [
      "Don’t walk or drive through flood water — moving water sweeps people and cars away.",
      "Stay away from fallen power lines and open drains.",
      "Don’t forward unverified alerts.",
    ],
    prepare: [
      "Keep an emergency kit: water, torch, power bank, medicines, documents in a waterproof bag.",
      "Know your nearest high ground or relief shelter.",
    ],
  },
  {
    id: "weather",
    title: "Severe weather",
    icon: CloudLightning,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "District disaster control room (most districts)", number: "1077" },
    ],
    doNow: [
      "Cyclone or storm: stay indoors, away from windows. Follow official evacuation orders.",
      "Lightning: get inside a building or a hard-top vehicle. If caught outside, crouch low away from trees and poles.",
      "Heatwave: stay in shade between noon and 3 pm, drink water often, and watch for dizziness or confusion.",
    ],
    avoid: [
      "Don’t shelter under isolated trees or near metal poles in lightning.",
      "Don’t go out during the calm ‘eye’ of a cyclone — winds return.",
    ],
    prepare: ["Check IMD forecasts before travel.", "Secure loose roof sheets and objects.", "Keep phones charged and a battery radio if possible."],
  },
  {
    id: "earthquake",
    title: "Earthquake",
    icon: House,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "District disaster control room (most districts)", number: "1077" },
    ],
    doNow: [
      "Drop, Cover and Hold On under sturdy furniture until shaking stops.",
      "If outdoors, move to an open area away from buildings, trees and wires.",
      "After shaking stops, leave damaged buildings carefully by the stairs.",
      "Expect aftershocks. Check yourself and others for injuries.",
    ],
    avoid: ["Don’t use lifts.", "Don’t run outside while the ground is shaking.", "Don’t light matches — there may be gas leaks."],
    prepare: ["Fix heavy shelves and cylinders to walls.", "Agree on a family meeting point.", "Keep an emergency kit near the exit."],
  },
  {
    id: "personal",
    title: "Personal safety",
    icon: ShieldUser,
    callFirst: [
      { label: "All emergencies", number: "112" },
      { label: "Women helpline", number: "181" },
      { label: "Child helpline", number: "1098" },
      { label: "Cyber crime", number: "1930" },
    ],
    doNow: [
      "Trust your instincts. Move towards a lit, busy place — a shop, pharmacy or police booth.",
      "Share your live location with someone you trust and start a check-in.",
      "Call 112 if you feel in danger — you don’t need to be certain.",
      "Note what you can safely observe: vehicle numbers, clothing, direction.",
    ],
    avoid: ["Don’t confront someone threatening you if you can move away.", "Don’t share your live location publicly on social media."],
    prepare: ["Keep your phone charged.", "Add two or three trusted contacts.", "Plan routes home before dark."],
  },
];

export const OFFICIAL_REMINDER = "Always follow current instructions from 112, local authorities and IMD/NDMA alerts. This guidance is general and not a substitute.";

export const HELPLINE_NOTE = "112 is India’s single emergency number. Other numbers can vary by state.";
