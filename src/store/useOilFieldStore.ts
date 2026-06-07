import { create } from 'zustand';
import type {
  OilWell,
  MeteringStation,
  UnionStation,
  Pipeline,
  InjectionWell,
  ProductionForecast,
} from '@/types';
import { generateInitialData } from '@/mock/data';

interface OilFieldState {
  oilWells: OilWell[];
  meteringStations: MeteringStation[];
  unionStations: UnionStation[];
  pipelines: Pipeline[];
  injectionWells: InjectionWell[];
  forecasts: ProductionForecast[];
  selectedWellId: string | null;
  setSelectedWellId: (id: string | null) => void;
  updateOilWell: (id: string, updates: Partial<OilWell>) => void;
  updateMeteringStation: (id: string, updates: Partial<MeteringStation>) => void;
  updateUnionStation: (id: string, updates: Partial<UnionStation>) => void;
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void;
  updateInjectionWell: (id: string, updates: Partial<InjectionWell>) => void;
  setAllData: (data: {
    oilWells: OilWell[];
    meteringStations: MeteringStation[];
    unionStations: UnionStation[];
    pipelines: Pipeline[];
    injectionWells: InjectionWell[];
    forecasts: ProductionForecast[];
  }) => void;
}

const initialData = generateInitialData();

export const useOilFieldStore = create<OilFieldState>((set) => ({
  ...initialData,
  selectedWellId: null,
  setSelectedWellId: (id) => set({ selectedWellId: id }),
  updateOilWell: (id, updates) =>
    set((state) => ({
      oilWells: state.oilWells.map((well) =>
        well.id === id ? { ...well, ...updates } : well
      ),
    })),
  updateMeteringStation: (id, updates) =>
    set((state) => ({
      meteringStations: state.meteringStations.map((station) =>
        station.id === id ? { ...station, ...updates } : station
      ),
    })),
  updateUnionStation: (id, updates) =>
    set((state) => ({
      unionStations: state.unionStations.map((station) =>
        station.id === id ? { ...station, ...updates } : station
      ),
    })),
  updatePipeline: (id, updates) =>
    set((state) => ({
      pipelines: state.pipelines.map((pipeline) =>
        pipeline.id === id ? { ...pipeline, ...updates } : pipeline
      ),
    })),
  updateInjectionWell: (id, updates) =>
    set((state) => ({
      injectionWells: state.injectionWells.map((well) =>
        well.id === id ? { ...well, ...updates } : well
      ),
    })),
  setAllData: (data) => set(data),
}));
