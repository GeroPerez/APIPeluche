package gordo.peluche.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import gordo.peluche.IService.ClienteIService;
import gordo.peluche.Entidades.Cliente;

@RestController
@RequestMapping("/api/clientes")

public class ClienteController {
    @Autowired
    private ClienteIService aService;

    @GetMapping
    public List<Cliente> getAllClientes() {
        return aService.findAllClientes();
    }

    @PostMapping
    public Cliente createCliente(@RequestBody Cliente cliente) {
        return aService.saveCliente(cliente);
    }
}
