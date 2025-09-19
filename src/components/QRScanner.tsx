import React, { useRef, useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X } from "lucide-react";

// Add CSS for QR scanner
const qrScannerStyles = `
  #qr-reader {
    border: 2px solid hsl(var(--border));
    border-radius: var(--radius);
  }
  #qr-reader__dashboard_section {
    background: hsl(var(--background));
  }
  #html5-qrcode-button-camera-permission {
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
  }
`;

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
  isOpen
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Add custom styles to document head
    const styleSheet = document.createElement("style");
    styleSheet.innerText = qrScannerStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          scanner.clear();
          scannerRef.current = null;
          setIsScanning(false);
        },
        (errorMessage) => {
          // Ignore errors - they happen frequently during scanning
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Scanner QR Code
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            id="qr-reader" 
            className="w-full"
            style={{ minHeight: '300px' }}
          />
          <p className="text-sm text-muted-foreground text-center">
            Aponte a câmera para o QR Code do show
          </p>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};