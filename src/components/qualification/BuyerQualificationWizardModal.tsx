import React from 'react';
import { AffordabilityWizard, AffordabilityWizardProps } from './AffordabilityWizard';

export interface WizardModalProps extends AffordabilityWizardProps {}

export const BuyerQualificationWizardModal: React.FC<WizardModalProps> = (props) => {
  return <AffordabilityWizard {...props} />;
};

export default BuyerQualificationWizardModal;
