import { v4 as uuidv4 } from 'uuid';
import { Software, CreateSoftwareDto, UpdateSoftwareDto } from '../dtos/software.dto';

let softwareItems: Software[] = [];

export const softwareRepository = {
    getAll: (): Software[] => {
        return softwareItems;
    },

    getById: (id: string): Software | undefined => {
        return softwareItems.find(item => item.id === id);
    },

    add: (dto: CreateSoftwareDto): Software => {
        const newItem: Software = {
            id: uuidv4(), 
            ...dto
        };
        softwareItems.push(newItem);
        return newItem;
    },

    update: (id: string, dto: UpdateSoftwareDto): Software | null => {
        const index = softwareItems.findIndex(item => item.id === id);
        if (index === -1) return null;

        const existingItem = softwareItems[index];
        if (!existingItem) return null;

        const updatedItem = { ...existingItem, ...dto, id: existingItem.id };
        softwareItems[index] = updatedItem;
        return updatedItem;
    },

    delete: (id: string): boolean => {
        const index = softwareItems.findIndex(item => item.id === id);
        if (index === -1) return false;

        softwareItems.splice(index, 1);
        return true;
    }
};