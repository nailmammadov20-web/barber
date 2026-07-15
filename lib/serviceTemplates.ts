export type ServiceTemplate = {
  name: string;
  durationMinutes: number;
  price: number;
};

// Genişləndirilib platformadakı real bərbərlərin öz xidmət siyahılarına əsasən
// (bir neçə fəal bərbərin faktiki menyusu nəzərdən keçirilib, adlar düzgün
// orfoqrafiya ilə, dublikatlar birləşdirilərək əlavə olunub).
export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  { name: "Saç kəsimi", durationMinutes: 30, price: 15 },
  { name: "Saqqal düzəltmə", durationMinutes: 20, price: 10 },
  { name: "Saqqal fadə", durationMinutes: 20, price: 10 },
  { name: "Sadə saqqal kəsimi", durationMinutes: 10, price: 5 },
  { name: "Saç + saqqal", durationMinutes: 45, price: 20 },
  { name: "Saç boyama", durationMinutes: 40, price: 20 },
  { name: "Saqqal boyama", durationMinutes: 20, price: 10 },
  { name: "Uşaq saç kəsimi", durationMinutes: 25, price: 10 },
  { name: "Saç yuma", durationMinutes: 15, price: 5 },
  { name: "Üz baxımı (maska)", durationMinutes: 20, price: 10 },
  { name: "Keratin", durationMinutes: 60, price: 40 },
  { name: "Qaş düzəltmə", durationMinutes: 10, price: 5 },
  { name: "Kirpik/qaş boyama", durationMinutes: 15, price: 8 },
  { name: "Saç modelləşdirmə", durationMinutes: 20, price: 10 },
  { name: "Lipucka", durationMinutes: 20, price: 5 },
];
