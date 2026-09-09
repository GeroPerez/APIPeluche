package gordo.peluche.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import gordo.peluche.IService.FacturaIService;
import gordo.peluche.Entidades.Factura;

@RestController
@RequestMapping("/api/factura")

public class FacturaController {
    @Autowired
    private FacturaIService aService;

    @GetMapping
    public List<Factura> getAllFacturas() {
        return aService.findAllFacturas();
    }

    @PostMapping
    public Factura createFactura(@RequestBody Factura factura) {
        return aService.saveFactura(factura);
    }
}