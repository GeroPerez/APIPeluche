package gordo.peluche.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import gordo.peluche.IService.ProductoIService;
import gordo.peluche.Entidades.Producto;

@RestController
@RequestMapping("/api/producto")

public class ProductoController {
    @Autowired
    private ProductoIService aService;

    @GetMapping
    public List<Producto> getAllProductos() {
        return aService.findAllProductos();
    }

    @PostMapping
    public Producto createProducto(@RequestBody Producto producto) {
        return aService.saveProducto(producto);
    }
}